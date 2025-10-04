// Quick script to register demo users via API
const users = [
  {
    name: "System Administrator",
    email: "admin@company.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "John Smith",
    email: "john@company.com",
    password: "emp123",
    role: "employee",
  },
  {
    name: "Sarah Johnson",
    email: "sarah@company.com",
    password: "emp123",
    role: "employee",
  },
];

async function registerUsers() {
  for (const user of users) {
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Registered: ${user.email}`);
      } else {
        console.log(`⚠️  ${user.email}: ${data.message}`);
      }
    } catch (error) {
      console.error(`❌ Error registering ${user.email}:`, error.message);
    }
  }
}

registerUsers();
