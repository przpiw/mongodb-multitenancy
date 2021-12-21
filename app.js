import connectDB from './services/mongo.connect.js'
import TenantSchema from './models/tenantSchema.js'
import EmployeeSchema from './models/employeeSchema.js'

const CompanySchemas = new Map([['employee', EmployeeSchema]])
const TenantSchemas = new Map([['tenant', TenantSchema]])

/** Switche to db on same connection pool
 * @return new connection
 */
const switchDB = async (dbName, dbSchema) => {
  const mongoose = await connectDB()
  if (mongoose.connection.readyState === 1) {
    const db = mongoose.connection.useDb(dbName, { useCache: true })
    // Prevent from schema re-registration
    if (!Object.keys(db.models).length) {
      dbSchema.forEach((schema, modelName) => {
        db.model(modelName, schema)
      })
    }
    return db
  }
  throw new Error('err')
}

/**
 * @return model from mongoose
 */
const getDBModel = async (db, modelName) => {
  return db.model(modelName)
}

const initTennants = async () => {
  const tenantDB = await switchDB('AppTenants', TenantSchemas)
  const tenant = await getDBModel(tenantDB, 'tenant')
  await tenant.deleteMany({})
  const tenantA = await tenant.create({
    name: 'Steve',
    email: 'Steve@example.com',
    password: 'secret',
    companyName: 'Apple',
  })
  const tenantB = await tenant.create({
    name: 'Bill',
    email: 'Bill@example.com',
    password: 'secret',
    companyName: 'Microsoft',
  })
  const tenantC = await tenant.create({
    name: 'Jeff',
    email: 'Jeff@example.com',
    password: 'secret',
    companyName: 'Amazon',
  })
}

const initEmployees = async () => {
  const customers = await getAllTenants()
  const createEmployees = customers.map(async (tenant) => {
    const companyDB = await switchDB(tenant.companyName, CompanySchemas)
    const employeeModel = await getDBModel(companyDB, 'employee')
    await employeeModel.deleteMany({})
    return employeeModel.create({
      employeeId: Math.floor(Math.random() * 10000).toString(),
      name: 'John',
      companyName: tenant.companyName,
    })
  })
  const results = await Promise.all(createEmployees)
}

const getAllTenants = async () => {
  const tenantDB = await switchDB('AppTenants', TenantSchemas)
  const tenantModel = await getDBModel(tenantDB, 'tenant')
  const tenants = await tenantModel.find({})
  return tenants
}

// list of employees for each company database
const listAllEmployees = async () => {
  const customers = await getAllTenants()
  const mapCustomers = customers.map(async (tenant) => {
    const companyDB = await switchDB(tenant.companyName, CompanySchemas)
    const employeeModel = await getDBModel(companyDB, 'employee')
    return employeeModel.find({})
  })
  const results = await Promise.all(mapCustomers)
  return results
}

;(async function run() {
  await initTennants()
  await initEmployees()
  const tenants = await getAllTenants()
  const employees = await listAllEmployees()

  console.log(employees)
})()
