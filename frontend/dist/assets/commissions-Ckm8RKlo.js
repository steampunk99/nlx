import{j as e,B as d,I as l}from"./index-CqXPVSZC.js";import{C as r,a as i,b as n,c,d as o}from"./card-Bw-7kV4D.js";import{T as h,a as m,b as x,c as t,d as j,e as a}from"./table-n7dG2OWS.js";const p=[{id:"COM001",user:"John Doe",referral:"Sarah Wilson",amount:"$150",type:"direct",package:"Professional Growth",status:"paid",date:"2024-01-20"},{id:"COM002",user:"Jane Smith",referral:"Mike Johnson",amount:"$75",type:"indirect",package:"Basic Starter",status:"pending",date:"2024-01-19"},{id:"COM003",user:"Mike Johnson",referral:"Alex Brown",amount:"$200",type:"direct",package:"Enterprise Elite",status:"paid",date:"2024-01-18"},{id:"COM004",user:"Sarah Wilson",referral:"Lisa White",amount:"$100",type:"direct",package:"Advanced Starter",status:"processing",date:"2024-01-17"}],f={pending:"bg-yellow-50 text-yellow-700",processing:"bg-blue-50 text-blue-700",paid:"bg-green-50 text-green-700"},u={direct:"bg-blue-50 text-blue-700",indirect:"bg-purple-50 text-purple-700"};function N(){return e.jsxs("div",{className:"flex flex-col gap-6 p-6",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:"Commissions"}),e.jsx("p",{className:"text-sm text-gray-500",children:"Track and manage referral commissions"})]}),e.jsxs(d,{className:"gap-2",children:[e.jsx(l,{icon:"ph:export-bold",className:"h-4 w-4"}),"Export Report"]})]}),e.jsxs("div",{className:"grid gap-6 md:grid-cols-2 lg:grid-cols-4",children:[e.jsxs(r,{children:[e.jsxs(i,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(n,{className:"text-sm font-medium",children:"Total Commissions"}),e.jsx(l,{icon:"ph:money-bold",className:"h-4 w-4 text-gray-500"})]}),e.jsxs(c,{children:[e.jsx("div",{className:"text-2xl font-bold",children:"$525"}),e.jsx("p",{className:"text-xs text-gray-500",children:"+15.2% from last month"})]})]}),e.jsxs(r,{children:[e.jsxs(i,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(n,{className:"text-sm font-medium",children:"Direct Referrals"}),e.jsx(l,{icon:"ph:users-bold",className:"h-4 w-4 text-blue-500"})]}),e.jsxs(c,{children:[e.jsx("div",{className:"text-2xl font-bold",children:"$450"}),e.jsx("p",{className:"text-xs text-gray-500",children:"3 commission(s)"})]})]}),e.jsxs(r,{children:[e.jsxs(i,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(n,{className:"text-sm font-medium",children:"Indirect Referrals"}),e.jsx(l,{icon:"ph:git-fork-bold",className:"h-4 w-4 text-purple-500"})]}),e.jsxs(c,{children:[e.jsx("div",{className:"text-2xl font-bold",children:"$75"}),e.jsx("p",{className:"text-xs text-gray-500",children:"1 commission(s)"})]})]}),e.jsxs(r,{children:[e.jsxs(i,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(n,{className:"text-sm font-medium",children:"Pending"}),e.jsx(l,{icon:"ph:clock-bold",className:"h-4 w-4 text-yellow-500"})]}),e.jsxs(c,{children:[e.jsx("div",{className:"text-2xl font-bold",children:"$75"}),e.jsx("p",{className:"text-xs text-gray-500",children:"1 commission(s)"})]})]})]}),e.jsxs(r,{children:[e.jsxs(i,{children:[e.jsx(n,{children:"Commission History"}),e.jsx(o,{children:"View all referral commissions and their status"})]}),e.jsx(c,{children:e.jsxs(h,{children:[e.jsx(m,{children:e.jsxs(x,{children:[e.jsx(t,{children:"ID"}),e.jsx(t,{children:"User"}),e.jsx(t,{children:"Referral"}),e.jsx(t,{children:"Type"}),e.jsx(t,{children:"Package"}),e.jsx(t,{children:"Amount"}),e.jsx(t,{children:"Date"}),e.jsx(t,{children:"Status"}),e.jsx(t,{children:"Actions"})]})}),e.jsx(j,{children:p.map(s=>e.jsxs(x,{children:[e.jsx(a,{className:"font-medium",children:s.id}),e.jsx(a,{children:s.user}),e.jsx(a,{children:s.referral}),e.jsx(a,{children:e.jsx("span",{className:`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${u[s.type]}`,children:s.type})}),e.jsx(a,{children:s.package}),e.jsx(a,{children:s.amount}),e.jsx(a,{children:s.date}),e.jsx(a,{children:e.jsx("span",{className:`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${f[s.status]}`,children:s.status})}),e.jsx(a,{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(d,{variant:"ghost",size:"icon",children:e.jsx(l,{icon:"ph:eye-bold",className:"h-4 w-4"})}),e.jsx(d,{variant:"ghost",size:"icon",children:e.jsx(l,{icon:"ph:receipt-bold",className:"h-4 w-4 text-gray-500"})})]})})]},s.id))})]})})]})]})}export{N as default};
