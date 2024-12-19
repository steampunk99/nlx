import{j as e,B as m,I as a}from"./index-CqXPVSZC.js";import{C as c,a as l,b as r,c as d,d as o}from"./card-Bw-7kV4D.js";import{T as j,a as p,b as h,c as t,d as g,e as n}from"./table-n7dG2OWS.js";const i=[{id:1,name:"Starter Package",description:"Basic investment packages for beginners",packages:3,minInvestment:"$100",maxInvestment:"$1,000",status:"active"},{id:2,name:"Professional",description:"Mid-level investment packages",packages:5,minInvestment:"$1,000",maxInvestment:"$10,000",status:"active"},{id:3,name:"Enterprise",description:"High-level investment packages",packages:4,minInvestment:"$10,000",maxInvestment:"$100,000",status:"active"},{id:4,name:"VIP",description:"Exclusive investment opportunities",packages:2,minInvestment:"$100,000",maxInvestment:"Unlimited",status:"inactive"}];function u(){return e.jsxs("div",{className:"flex flex-col gap-6 p-6",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:"Package Categories"}),e.jsx("p",{className:"text-sm text-gray-500",children:"Manage investment package categories"})]}),e.jsxs(m,{className:"gap-2",children:[e.jsx(a,{icon:"ph:plus-bold",className:"h-4 w-4"}),"Add Category"]})]}),e.jsxs("div",{className:"grid gap-6 md:grid-cols-2 lg:grid-cols-4",children:[e.jsxs(c,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(r,{className:"text-sm font-medium",children:"Total Categories"}),e.jsx(a,{icon:"ph:folders-bold",className:"h-4 w-4 text-gray-500"})]}),e.jsx(d,{children:e.jsx("div",{className:"text-2xl font-bold",children:i.length})})]}),e.jsxs(c,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(r,{className:"text-sm font-medium",children:"Active Categories"}),e.jsx(a,{icon:"ph:check-circle-bold",className:"h-4 w-4 text-green-500"})]}),e.jsx(d,{children:e.jsx("div",{className:"text-2xl font-bold",children:i.filter(s=>s.status==="active").length})})]}),e.jsxs(c,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(r,{className:"text-sm font-medium",children:"Total Packages"}),e.jsx(a,{icon:"ph:package-bold",className:"h-4 w-4 text-gray-500"})]}),e.jsx(d,{children:e.jsx("div",{className:"text-2xl font-bold",children:i.reduce((s,x)=>s+x.packages,0)})})]}),e.jsxs(c,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(r,{className:"text-sm font-medium",children:"Avg. Packages"}),e.jsx(a,{icon:"ph:chart-bar-bold",className:"h-4 w-4 text-gray-500"})]}),e.jsx(d,{children:e.jsx("div",{className:"text-2xl font-bold",children:Math.round(i.reduce((s,x)=>s+x.packages,0)/i.length)})})]})]}),e.jsxs(c,{children:[e.jsxs(l,{children:[e.jsx(r,{children:"Package Categories"}),e.jsx(o,{children:"View and manage investment package categories"})]}),e.jsx(d,{children:e.jsxs(j,{children:[e.jsx(p,{children:e.jsxs(h,{children:[e.jsx(t,{children:"Name"}),e.jsx(t,{children:"Description"}),e.jsx(t,{children:"Packages"}),e.jsx(t,{children:"Min Investment"}),e.jsx(t,{children:"Max Investment"}),e.jsx(t,{children:"Status"}),e.jsx(t,{children:"Actions"})]})}),e.jsx(g,{children:i.map(s=>e.jsxs(h,{children:[e.jsx(n,{className:"font-medium",children:s.name}),e.jsx(n,{children:s.description}),e.jsx(n,{children:s.packages}),e.jsx(n,{children:s.minInvestment}),e.jsx(n,{children:s.maxInvestment}),e.jsx(n,{children:e.jsx("span",{className:`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${s.status==="active"?"bg-green-50 text-green-700":"bg-gray-50 text-gray-700"}`,children:s.status})}),e.jsx(n,{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(m,{variant:"ghost",size:"icon",children:e.jsx(a,{icon:"ph:pencil-bold",className:"h-4 w-4"})}),e.jsx(m,{variant:"ghost",size:"icon",children:e.jsx(a,{icon:"ph:trash-bold",className:"h-4 w-4 text-red-500"})})]})})]},s.id))})]})})]})]})}export{u as default};