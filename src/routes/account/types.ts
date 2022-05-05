export type IAccount = {
  id: string;
  name: string;
  cpf: string;
  statement: IStatement[];
};

export type IStatement = {
  description: string;
  amount: number;
  createdAt: Date | string;
  type: string;
};