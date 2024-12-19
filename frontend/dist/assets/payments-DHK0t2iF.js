import{j as e,B as y,b as T,Q as E,u as I,a as C,r as i,w as m}from"./index-CqXPVSZC.js";import{u as k,P as A,a as n}from"./usePackages-BbWeA79o.js";import{L}from"./label-Cax8PUHg.js";import{I as B}from"./input-3cV1rw2q.js";import"./dialog-n4gnCksP.js";import"./loader-circle-Bbd1q_nT.js";const O=[{id:"MTN_MOBILE",name:"MTN Mobile Money",icon:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"currentColor",className:"text-yellow-500",children:[e.jsx("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"}),e.jsx("path",{d:"M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"})]}),description:"Pay via MTN Mobile Money"}];function U({selectedMethod:t,onMethodSelect:o}){return e.jsx("div",{className:"grid gap-4",children:O.map(s=>e.jsx("div",{children:e.jsx(y,{type:"button",variant:t===s.id?"default":"outline",className:T("flex flex-col items-center justify-center gap-3 h-24 transition-all p-4 w-full",t===s.id?"bg-gradient-to-r from-primary to-purple-500 text-white":"hover:bg-muted/50"),onClick:()=>o(s.id),children:e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[s.icon,e.jsx("span",{className:"text-sm font-medium",children:s.name})]})})},s.id))})}function _({selectedPackage:t}){return t?e.jsxs("div",{className:"p-4 rounded-xl bg-gradient-to-br from-muted/80 to-muted",children:[e.jsxs("div",{className:"flex justify-between items-center mb-2",children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"Package Price"}),e.jsx("span",{className:"font-medium",children:t.price})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"Processing Fee"}),e.jsx("span",{className:"font-medium",children:"UGX 0"})]}),e.jsx("div",{className:"mt-3 pt-3 border-t border-border",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium",children:"Total Amount"}),e.jsx("span",{className:"text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500",children:t.price})]})})]}):null}function q(){var p;const t=E();I();const{user:o}=C(),[s,b]=i.useState("MTN_MOBILE"),[l,j]=i.useState((o==null?void 0:o.phone)||""),[d,u]=i.useState(!1),[x,r]=i.useState(null),[N,h]=i.useState(!1),{purchasePackageMutation:P}=k({onPaymentStatusChange:r}),a=(p=t.state)==null?void 0:p.selectedPackage,M=c=>{b(c)},v=async()=>{if(!l){m.error("Please enter your mobile money number");return}if(!/^(0|\+?256)?(7[0-9]{8})$/.test(l)){m.error("Please enter a valid Ugandan mobile number");return}try{u(!0),r(n.WAITING),h(!0),console.group("Payment Initiation"),console.log("Selected Package:",{id:a.id,name:a.name,price:a.price}),console.log("Phone Number:",l);const g={trans_id:`TRA${Date.now()}${Math.floor(Math.random()*1e3)}`,packageId:a.id,amount:a.price,phoneNumber:l};console.log("Payment Payload:",g),await P.mutateAsync(g),console.log("Payment request sent successfully"),console.groupEnd()}catch(f){r(n.FAILED),m.error(f.message||"Payment failed. Please try again.")}finally{u(!1)}},S=()=>{[n.FAILED,n.SUCCESS,n.TIMEOUT].includes(x)&&(h(!1),r(null))},w=()=>{r(n.TIMEOUT)};return a?e.jsxs("div",{className:"max-w-lg mx-auto",children:[e.jsxs("h1",{className:"text-2xl font-semibold mb-4",children:["Payment for ",a.name]}),e.jsx(U,{selectedMethod:s,onMethodSelect:M}),e.jsxs("div",{className:"mt-4",children:[e.jsx("div",{className:"mb-2",children:e.jsx(L,{children:"Mobile Money Number"})}),e.jsx(B,{id:"phone",name:"phone",type:"tel",placeholder:"Enter your mobile money number",value:l,onChange:c=>j(c.target.value),"aria-labelledby":"phone-label",className:"mt-1"})]}),e.jsx("div",{className:"mt-6",children:e.jsx(_,{selectedPackage:a})}),e.jsx("div",{className:"mt-6",children:e.jsx(y,{className:"w-full",onClick:v,disabled:d,children:d?"Processing...":"Confirm Payment"})}),e.jsx(A,{isOpen:N,status:x,onClose:S,onTimeout:w})]}):e.jsx("div",{children:"No package selected. Please select a package first."})}export{q as default};
