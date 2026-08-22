import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main(){
  const company=await db.company.create({data:{name:"Juma Aluminium Works",brandName:"Juma Aluminium Works",phone:"+255 712 458 903",whatsapp:"+255 712 458 903",email:"info@jumaaluminium.co.tz",address:"Nyerere Road, Vingunguti",city:"Dar es Salaam",country:"Tanzania",currency:"TZS",description:"Aluminium, PVC, glass and fabrication workshop.",tagline:"Fast, clear quotations for fabrication work.",quotationValidityDays:14,paymentTerms:"50% deposit to confirm order, balance on completion.",warrantyTerms:"Warranty according to agreed terms.",deliveryTerms:"Installation date is agreed after deposit."}});
  await db.user.createMany({data:[{companyId:company.id,name:"Workshop Admin",email:"admin@jumaaluminium.co.tz",role:"ADMIN",canSeePricingConfig:true},{companyId:company.id,name:"Workshop Staff",email:"staff@jumaaluminium.co.tz",role:"EMPLOYEE",canSeePricingConfig:false}]});
  const products=[
    ["Aluminium","ALU_SLIDING_WINDOW","Sliding Window"],["Aluminium","ALU_CASEMENT_WINDOW","Casement Window"],["Aluminium","ALU_DOOR","Aluminium Door"],["Aluminium","ALU_SLIDING_DOOR","Sliding Door"],["Aluminium","ALU_SHOP_FRONT","Shop Front"],["Aluminium","ALU_PARTITION","Partition"],["PVC","PVC_WINDOW","PVC Window"],["PVC","PVC_DOOR","PVC Door"],["Shower / Glass","SHOWER_DOOR","Shower Door"],["Shower / Glass","GLASS_RAILING","Glass Railing"] as const;
  await db.product.createMany({data:products.map(([category,productKey,name])=>({companyId:company.id,category,productKey,name,unit:"sqm"}))});
  const rates=[
    ["ALU_PROFILE","Aluminium Profile",85000],["ALU_DOOR_PROFILE","Aluminium Door Profile",110000],["ALU_SHOP_PROFILE","Aluminium Shop Profile",95000],["ALU_PARTITION_PROFILE","Aluminium Partition Profile",70000],["PVC_PROFILE","PVC Profile",72000],["PVC_DOOR_PROFILE","PVC Door Profile",80000],["SHOWER_PROFILE","Shower Profile",65000],["RAILING_PROFILE","Railing Profile",90000],["GLASS_5MM","5mm Glass",42000],["GLASS_6MM","6mm Glass",55000],["TEMPERED_8MM","8mm Tempered Glass",95000],["TEMPERED_10MM","10mm Tempered Glass",120000],["ACCESSORIES_WINDOW","Window Accessories",18000],["ACCESSORIES_DOOR","Door Accessories",35000],["ACCESSORIES_PARTITION","Partition Accessories",22000],["ACCESSORIES_SHOWER","Shower Hardware",45000],["ACCESSORIES_RAILING","Railing Hardware",50000],["LABOUR","Fabrication Labour",15000],["INSTALLATION","Installation",20000] ] as const;
  for(const [key,name,rate] of rates) await db.material.create({data:{companyId:company.id,name,materialKey:key,unit:key.includes("GLASS")||key.includes("PROFILE")?"sqm":"piece",rates:{create:{rate,notes:"Initial workshop rate"}}}});
  const customer=await db.customer.create({data:{companyId:company.id,fullName:"Grace Mushi",phone:"+255 712 345 678",whatsapp:"+255 712 345 678",email:"grace.mushi@example.test",city:"Dar es Salaam",projectLocation:"Mikocheni B"}});
  const project=await db.project.create({data:{companyId:company.id,customerId:customer.id,name:"Mikocheni Residence",projectType:"Mixed fabrication",location:"Mikocheni B, Dar es Salaam",status:"MEASUREMENT"}});
  await db.measurementItem.createMany({data:[
    {projectId:project.id,ref:"A01",productKey:"ALU_SLIDING_WINDOW",productName:"Aluminium Sliding Window",widthMm:1200,heightMm:1500,quantity:4,spec:{glass:"5mm Clear"},notes:"Living room"},
    {projectId:project.id,ref:"A02",productKey:"ALU_DOOR",productName:"Aluminium Door",widthMm:900,heightMm:2100,quantity:1,spec:{glass:"6mm Clear"},notes:"Main entrance"},
    {projectId:project.id,ref:"P01",productKey:"PVC_WINDOW",productName:"PVC Window",widthMm:1000,heightMm:1200,quantity:2,spec:{glass:"5mm Clear"},notes:"Bedrooms"},
    {projectId:project.id,ref:"G01",productKey:"SHOWER_DOOR",productName:"Shower Door",widthMm:800,heightMm:1900,quantity:2,spec:{glass:"8mm Tempered"},notes:"Bathrooms"}
  ]});
  console.log(`Seeded company ${company.id} and project ${project.id}`);
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>db.$disconnect());
