const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NodePaymentService {
    constructor() {}

    async createMobileMoneyPayment(data, tx = prisma) {
        const paymentData = {
          ...data,
          status: 'PENDING',
          createdAt: new Date(),
          paymentMethod: 'mobile money',
          phoneNumber: data.phone,
          reference: data.trans_id,
          transactionId: data.trans_id,
          type: 'mobile money',
          
        };
    
        return tx.nodePayment.create({
          data: paymentData,
          include: {
            node: {
              include: {
                user: true
              }
            },
            package: true
          }
        });
      }

      async updateMobileMoneyPaymentStatus(id, status, tx = prisma) {
        const data = {
            status,
           
          // Only set activatedAt when payment is completed
          ...(status === 'COMPLETED' && {
            activatedAt: new Date()
          })
        };
    
        return tx.nodePayment.update({
          where: { id },
          data,
          include: {
            node: {
              include: {
                user: true
              }
            },
            package: true
          }
        });
      }
    

    async findAll(nodeId, { startDate, endDate, type } = {}) {
        const where = {};

        if (nodeId) {
            where.nodeId = nodeId;
        }

        if (startDate && endDate) {
            where.createdAt = {
                gte: startDate,
                lte: endDate
            };
        }

        if (type) {
            where.type = type;
        }

        return prisma.nodePayment.findMany({
            where,
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
               
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findById(id) {
        return prisma.nodePayment.findUnique({
            where: { id },
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
               
            }
        });
    }

    async findByNodeId(nodeId) {
        return prisma.nodePayment.findMany({
            where: {
                nodeId
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
               
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async create(paymentData, tx = prisma) {
        const data = {
            ...paymentData,
            status: 'PENDING',
            createdAt: new Date(),
            paymentMethod: 'mobile money',
            phoneNumber: paymentData.phone
        };

        return tx.nodePayment.create({
            data,
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
               
            }
        });
    }

    async update(id, paymentData, tx = prisma) {
        return tx.nodePayment.update({
            where: { id },
            data: paymentData,
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
               
            }
        });
    }

    async updateStatus(id, status, reason = null, tx = prisma) {
        const data = {
            status,
            
        };

        return tx.nodePayment.update({
            where: { id },
            data,
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
               
            }
        });
    }

    async getTotalPayments(nodeId, { startDate, endDate, type } = {}) {
        const where = {
            nodeId,
            status: 'COMPLETED'
        };

        if (startDate && endDate) {
            where.createdAt = {
                gte: startDate,
                lte: endDate
            };
        }

        if (type) {
            where.type = type;
        }

        const result = await prisma.nodePayment.aggregate({
            where,
            _sum: {
                amount: true
            }
        });
        return result._sum.amount || 0;
    }

    async getPaymentStats(nodeId) {
        const [pending, completed, failed] = await Promise.all([
            prisma.nodePayment.count({
                where: {
                    nodeId,
                    status: 'PENDING'
                }
            }),
            prisma.nodePayment.count({
                where: {
                    nodeId,
                    status: 'COMPLETED'
                }
            }),
            prisma.nodePayment.count({
                where: {
                    nodeId,
                    status: 'FAILED'
                }
            })
        ]);

        return {
            pending,
            completed,
            failed
        };
    }

    //find by reference
    async findByReference(reference) {
        return prisma.nodePayment.findUnique({
            where: { reference }
        });
    }

    async findPendingPayments(nodeId) {
        return prisma.nodePayment.findMany({
            where: {
                nodeId,
                status: 'PENDING'
            },
            include: {
                node: {
                    include: {
                        user: true
                    }
                },
                package: true,
               
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

  
}

module.exports = new NodePaymentService();
