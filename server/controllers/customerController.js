import Customer from "../models/Customer.js";
import Log from "../models/Log.js";

export const createCustomer = async (req, res) => {
  try {
    const customerData = {
      ...req.body,
      createdBy: req.user._id,
    };
    
    // Remove id field if present (MongoDB will generate _id)
    delete customerData.id;
    
    const customer = await Customer.create(customerData);
    
    // Return customer with id field for frontend compatibility
    const customerObj = customer.toObject();
    customerObj.id = customerObj._id.toString();
    
    res.status(201).json(customerObj);
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({ message: "Failed to create customer", error: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    console.log("GET /customers - User:", req.user?.email);
    const customers = await Customer.find().populate("createdBy", "name role");
    console.log("Found customers:", customers.length);
    
    // Map _id to id for frontend compatibility
    const customersWithId = customers.map(customer => {
      const customerObj = customer.toObject();
      customerObj.id = customerObj._id.toString();
      return customerObj;
    });
    
    console.log("Sending customers to frontend:", customersWithId.length);
    res.json(customersWithId);
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ message: "Failed to fetch customers", error: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customerData = { ...req.body };
    
    // Remove fields that shouldn't be updated
    delete customerData.id;
    delete customerData._id;
    delete customerData.createdBy;
    delete customerData.createdAt;
    delete customerData.updatedAt;
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      customerData,
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Return customer with id field for frontend compatibility
    const customerObj = customer.toObject();
    customerObj.id = customerObj._id.toString();
    
    res.json(customerObj);
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ message: "Failed to update customer", error: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ message: "Failed to delete customer", error: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  const logs = await Log.find({ customer: customer._id }).populate(
    "addedBy",
    "name"
  );
  res.json({ ...customer.toObject(), logs });
};

export const addLogToCustomer = async (req, res) => {
  const { note } = req.body;
  const log = await Log.create({
    customer: req.params.id,
    note,
    addedBy: req.user._id,
  });
  res.status(201).json(log);
};

export const moveCustomerToTravelling = async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  customer.status = "travelling";
  await customer.save();
  res.json({ message: "Customer moved to travelling section", customer });
};
