const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.user.id;

    // Get total earnings and calculate trend
    const [currentMonthEarnings, lastMonthEarnings] = await Promise.all([
      prisma.commission.aggregate({
        where: {
          userId,
          status: 'PROCESSED',
          createdAt: {
            gte: new Date(new Date().setDate(1)) // Start of current month
          }
        },
        _sum: { amount: true }
      }),
      prisma.commission.aggregate({
        where: {
          userId,
          status: 'PROCESSED',
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)),
            lt: new Date(new Date().setDate(1))
          }
        },
        _sum: { amount: true }
      })
    ]);

    // Calculate earnings trend
    const currentAmount = currentMonthEarnings._sum.amount || 0;
    const lastAmount = lastMonthEarnings._sum.amount || 0;
    const earningsTrend = lastAmount === 0 ? '+100%' : 
      `${((currentAmount - lastAmount) / lastAmount * 100).toFixed(1)}%`;

    // Get network size and trend
    const userNode = await prisma.node.findFirst({
      where: { userId },
      include: {
        sponsored: true,
        children: {
          include: {
            package: true
          }
        }
      }
    });

    const networkSize = userNode ? await prisma.node.count({
      where: {
        sponsorId: userNode.id
      }
    }) : 0;

    // Calculate network trend (last 30 days vs previous 30 days)
    const [recentReferrals, previousReferrals] = await Promise.all([
      prisma.node.count({
        where: {
          sponsorId: userNode?.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.node.count({
        where: {
          sponsorId: userNode?.id,
          createdAt: {
            gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const networkTrend = previousReferrals === 0 ? '+100%' :
      `${((recentReferrals - previousReferrals) / previousReferrals * 100).toFixed(1)}%`;

    // Get active packages count and trend
    const activePackages = userNode?.children?.filter(node => 
      node.package?.status === 'ACTIVE'
    ).length || 0;

    // Calculate package trend
    const [currentPackages, lastMonthPackages] = await Promise.all([
      prisma.nodePackage.count({
        where: {
          node: {
            sponsorId: userNode?.id
          },
          status: 'ACTIVE',
          createdAt: {
            gte: new Date(new Date().setDate(1))
          }
        }
      }),
      prisma.nodePackage.count({
        where: {
          node: {
            sponsorId: userNode?.id
          },
          status: 'ACTIVE',
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)),
            lt: new Date(new Date().setDate(1))
          }
        }
      })
    ]);

    const packagesTrend = lastMonthPackages === 0 ? '+100%' :
      `${((currentPackages - lastMonthPackages) / lastMonthPackages * 100).toFixed(1)}%`;

    return res.json({
      success: true,
      data: {
        totalEarnings: `$${currentAmount.toFixed(2)}`,
        earningsTrend,
        networkSize: networkSize.toString(),
        networkTrend,
        activePackages: activePackages.toString(),
        packagesTrend
      }
    });

  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

const getRecentActivities = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.user.id;

    // Get recent commissions and network activities
    const [commissions, networkActivities] = await Promise.all([
      prisma.commission.findMany({
        where: {
          userId,
          status: 'PROCESSED'
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          package: true
        }
      }),
      prisma.node.findMany({
        where: {
          sponsorId: {
            equals: (await prisma.node.findFirst({ where: { userId } }))?.id
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          user: true
        }
      })
    ]);

    // Combine and format activities
    const activities = [
      ...commissions.map(comm => ({
        type: 'commission',
        description: `Earned commission from ${comm.package?.name || 'package'}`,
        amount: `$${comm.amount.toFixed(2)}`,
        date: comm.createdAt,
        icon: '💰'
      })),
      ...networkActivities.map(node => ({
        type: 'network',
        description: `New referral: ${node.user.firstName} ${node.user.lastName}`,
        amount: '',
        date: node.createdAt,
        icon: '👥'
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 10);

    return res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error in getRecentActivities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities'
    });
  }
};

const getNetworkStats = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.user.id;

    //get user node
    const userNode = await prisma.node.findFirst({
      where: { userId }
    });

    if (!userNode) {
      return res.status(404).json({
        success: false,
        message: 'Network not found'
      });
    }

    // Get all levels data
    const levels = await Promise.all(
      Array.from({ length: 5 }, async (_, i) => {
        const level = i + 1;
        
        // Get nodes at this level
        const nodesAtLevel = await prisma.node.findMany({
          where: {
            sponsorId: userNode.id,
            level: level
          },
          include: {
            user:true,
            statements: {
              where: {
                type: 'COMMISSION',
                status: {
                  in: ['PENDING', 'PROCESSED']
                }
              },
              select: {
                amount: true
              }
            }
          }
        });

        // Calculate stats for this level
        const members = nodesAtLevel.length;
        const active = nodesAtLevel.filter(node => node.status === 'ACTIVE').length;
     
        // Sum up all commission statements
        const levelCommissions = nodesAtLevel.reduce((total, node) => {
          const nodeCommissions = node.statements.reduce((sum, statement) => {
            return sum + Number(statement.amount);
          }, 0);
          return total + nodeCommissions;
        }, 0);

        console.log(`Level ${level} stats:`, {
          members,
          active,
          levelCommissions,
          nodesCount: nodesAtLevel.length,
          statementsCount: nodesAtLevel.reduce((sum, node) => sum + node.statements.length, 0)
        });
  
        return {
          level,
          members,
          active,
          commissionss: formatAmount(levelCommissions)
        };
      })
    );
console.log('Final response data for network levels:', levels)
    return res.json({
      success: true,
      data: levels
    });

  } catch (error) {
    console.error('Error in getNetworkStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch network statistics'
    });
  }
};



// Helper function to format amounts
const formatAmount = (amount) => {
  if (!amount) return "UGX 0";
  return `UGX ${Number(amount).toLocaleString()}`;
};

const getEarnings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.user.id;

    // Get total earnings
    const availableBalance = await prisma.node.findFirst({
      where: {
        userId,
      }
    });

    // Get pending earnings
    const pendingEarnings = await prisma.commission.aggregate({
      where: {
        userId,
        status: 'PENDING'
      },
      _sum: {
        amount: true
      }
    });

    // Get earnings history
    const history = await prisma.commission.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20,
      select: {
        amount: true,
        type: true,
        status: true,
        createdAt: true
      }
    });

    return res.json({
      success: true,
      data: {
        availableBalance: `$${(availableBalance?.availableBalance || 0).toFixed(2)}`,
        pendingBalance: `$${(pendingEarnings?._sum.amount || 0).toFixed(2)}`,
        history: history.map(item => ({
          amount: `$${item.amount.toFixed(2)}`,
          type: item.type,
          status: item.status,
          date: item.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error in getEarnings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings data'
    });
  }
};

// Helper function to calculate total network size
async function calculateTotalNetwork(nodeId) {
  const directReferrals = await prisma.node.findMany({
    where: {
      sponsorId: nodeId
    },
    select: {
      id: true
    }
  });

  let total = directReferrals.length;
  for (const referral of directReferrals) {
    total += await calculateTotalNetwork(referral.id);
  }

  return total;
}

module.exports = {
  getDashboardStats,
  getRecentActivities,
  getNetworkStats,
  getEarnings
};
