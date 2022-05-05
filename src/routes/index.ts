import express from 'express';

import account from './account';

const app = express();

app.use(express.json());

//  ACCOUNTS
app.use('/', account);

app.listen(3000, () => {
  console.log('server started 🔥')!;
});