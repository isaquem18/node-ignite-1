import { Router, Request, Response } from 'express';
import { v4 } from 'uuid';

import { getBalance } from '../../utils/getBalance';
import { IAccount, IStatement } from './types';
import validateCPF from  '../../utils/validateCPF';
import { formatDate } from '../../utils/formatDate';

const route = Router();

const customers:IAccount[] = [];

// TYPES 

type IRequest = Request & {
  customer: IAccount;
}

// MIDDLEWARES

function verifyIfAccountCPFExists(req: any, res: any, next: any) {

  const { cpf } = req?.headers;

  const customer = customers.find(item => item.cpf === cpf);
  

  if (!customer) return res.status(404).json({ 
    type: 'error',
    mesage: 'customer not found.'
  });

  req.customer = customer;

  
  return next();
};
 

// ROUTES 

route.get('/account', verifyIfAccountCPFExists, (req: IRequest, res: any) => {
  const { customer } = req;

  return res.status(200).json(customer)
});

route.post('/account', (req: IRequest, res: any) => {
  let { cpf, name } = req.body;

  name = String(name);
  cpf = String(cpf);

  const isCPFValid = validateCPF(cpf);
  const isNameLengthValid = name.length > 8;

  if (!isCPFValid || !isNameLengthValid) {
    return res.status(400).json({ 
      type: 'error', 
      message: 'invalid data.' 
    });
  }

  const checkIfCPFAlreadyExists = customers
  .some((item: IAccount) => {
    return item.cpf === cpf;
  });

  if (checkIfCPFAlreadyExists) {
    return res.status(401).json({ 
      type: 'error', 
      message: 'user already exists.' 
    });
  }

 
  const newUser: IAccount = {
    id: v4(),
    name,
    cpf,
    statement: []
  };

  customers.push(newUser);

  res.status(201).json({ 
    type: 'success', 
    data: newUser 
  });

});

route.put('/account', verifyIfAccountCPFExists, (req:IRequest, res: any) => {
  const { customer } = req;
  const { name } = req.body;
  
  customer.name = name;

  return res.status(201).send();

});

route.delete('/account', verifyIfAccountCPFExists, (req: IRequest, res: any) => {
  const { customer } = req;

  customers.splice(+customer, 1);

  return res.status(200).send();
});

route.get('/statement', verifyIfAccountCPFExists, (req: IRequest, res: any) => {

  const customer = req?.customer;

  return res.status(200).json({ type: 'success', statement: customer?.statement });
});

route.get('/statements/date', verifyIfAccountCPFExists, (req: any, res: any) => {
  const { customer } = req;
  const { date } = req.query;

  const formattedDate = formatDate(date);

  const statement = customer.statement.filter((item: IStatement) => {
    return formatDate(item.createdAt) === formattedDate
  })

  return res.status(200).json(statement);
});

route.post('/deposit', verifyIfAccountCPFExists, (req: IRequest, res: any) => {
  const customer = req?.customer;
  
  const { description, amount } = req.body;

  const statementOperation = {
    description,
    amount,
    createdAt: new Date(),
    type: 'credit'
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();

});

route.post('/withdraw', verifyIfAccountCPFExists, (req: IRequest, res: any) => {
  const { amount, description } = req.body;

  const { customer } = req;

  const backResult = getBalance(customer.statement);

  if (amount > backResult) {
    return res.status(401).json({
      type: 'Error',
      message: 'Insufficient funds.'
    })
  }

  const statementOperation = {
    description,
    amount,
    createdAt: new Date(),
    type: 'debit'
  };

  console.log(backResult);

  customer.statement.push(statementOperation);  

  return res.end();

});


export default route;
