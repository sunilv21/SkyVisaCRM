export interface Employee {
  id: string
  name: string
  email: string
  department: string
}

// Sample employees - in a real app, this would come from a database
export const EMPLOYEES: Employee[] = [
  { id: "emp1", name: "John Smith", email: "john@company.com", department: "Sales" },
  { id: "emp2", name: "Sarah Johnson", email: "sarah@company.com", department: "Sales" },
  { id: "emp3", name: "Mike Davis", email: "mike@company.com", department: "Support" },
  { id: "emp4", name: "Lisa Wilson", email: "lisa@company.com", department: "Marketing" },
  { id: "emp5", name: "David Brown", email: "david@company.com", department: "Sales" },
]

export function getEmployeeById(id: string): Employee | undefined {
  return EMPLOYEES.find((emp) => emp.id === id)
}

export function getEmployeeByName(name: string): Employee | undefined {
  return EMPLOYEES.find((emp) => emp.name === name)
}
