async function getEmployeeId(user_id) {
  try {
    const employee_result = await db.query('SELECT employeeid FROM public.useraccount WHERE userid = $1', [user_id]);
    return employee_result.rows.length > 0 ? employee_result.rows[0].employeeid : null;
  }catch (err) {
    console.error(`Error fetching employee ID for user ${user_id}:`, err);
    throw err; // Return null if there's an error fetching the employee ID
  }
}

async function bulkInsert(table, columns, rows) {
  if (rows.length === 0) return; // No rows to insert

  // Placeholder groups
  const placeholders = rows.map((_, rowIndex) => {
    const startIndex = rowIndex * columns.length + 1;
    const rowPlaceholders = columns.map((_, colIndex) => `$${startIndex + colIndex}`);
    return `(${rowPlaceholders.join(', ')})`;
  }).join(', ');

  // Flatten the rows values into a single array for parameterized query
  const values = rows.flatMap(row => columns.map(col => row[col]));
  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
  
  try {
    await db.query(query, values);
  } catch (err) {
    console.error(`Error bulk inserting into ${table}:`, err);
    throw err; // Rethrow the error to be handled by the caller
  }
}

module.exports = {
  getEmployeeId,
  bulkInsert
};