import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Customer from "./models/Customer.js";

dotenv.config();

const testCustomers = async () => {
  try {
    await connectDB();
    
    const customers = await Customer.find();
    console.log("\n=== CUSTOMERS IN DATABASE ===");
    console.log("Total customers:", customers.length);
    
    if (customers.length > 0) {
      console.log("\nCustomer details:");
      customers.forEach((customer, index) => {
        console.log(`\n${index + 1}. ${customer.name}`);
        console.log(`   Email: ${customer.email}`);
        console.log(`   Phone: ${customer.phone}`);
        console.log(`   Status: ${customer.status}`);
        console.log(`   ID: ${customer._id}`);
      });
    } else {
      console.log("\n⚠️  No customers found in database!");
      console.log("You need to create customers first.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testCustomers();
