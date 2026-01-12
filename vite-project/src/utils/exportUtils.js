/**
 * Export expenses as CSV file
 * @param {Array} expenses - Array of expense objects
 * @param {String} fileName - Optional name for the downloaded file
 */
export const exportExpensesAsCSV = (expenses, fileName = 'expenses.csv') => {
    if (!expenses || expenses.length === 0) {
        alert('No expenses to download');
        return;
    }

    // Define CSV headers
    const headers = ['Date', 'Time', 'Description', 'Category', 'Amount (₹)'];

    // Convert expenses to CSV rows
    const rows = expenses.map((expense) => [
        expense.date || '',
        expense.time || '',
        expense.description || '',
        expense.category || '',
        parseFloat(expense.amount || 0).toFixed(2),
    ]);

    // Add total row
    const totalAmount = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    rows.push(['', '', 'TOTAL', '', totalAmount.toFixed(2)]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
            row
                .map((cell) => {
                    // Escape quotes and wrap in quotes if contains comma
                    const cellStr = String(cell).replace(/"/g, '""');
                    return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
                })
                .join(',')
        ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Export expenses as JSON file
 * @param {Array} expenses - Array of expense objects
 * @param {String} fileName - Optional name for the downloaded file
 */
export const exportExpensesAsJSON = (expenses, fileName = 'expenses.json') => {
    if (!expenses || expenses.length === 0) {
        alert('No expenses to download');
        return;
    }

    const totalAmount = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    const data = {
        exportDate: new Date().toISOString(),
        totalExpenses: expenses.length,
        totalAmount,
        expenses,
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
