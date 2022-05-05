export function formatDate(date: any) {

  const dateFormat = Intl.DateTimeFormat('pt-br', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(String(date)));

  return dateFormat;

};