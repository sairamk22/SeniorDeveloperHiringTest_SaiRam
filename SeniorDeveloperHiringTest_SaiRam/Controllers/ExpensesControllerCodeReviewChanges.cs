using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using SeniorDeveloperHiringTest_SaiRam.Models;

namespace Sai_Ram_Kaleru_Senior_Developer_Hiring_Test___Fullstack_Track.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesControllerCodeReviewChanges : ControllerBase
{
    private readonly string _connString;
    private readonly ILogger<ExpensesControllerCodeReviewChanges> _logger;

    public ExpensesControllerCodeReviewChanges(IConfiguration configuration, ILogger<ExpensesControllerCodeReviewChanges> logger)
    {
        _connString = configuration.GetConnectionString("FinanceDb")
            ?? throw new InvalidOperationException("Connection string 'FinanceDb' not found."); // 1. Fixed connection string
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) // 3. Fixed input validation
            return BadRequest("UserId is required.");

        var expenses = new List<Expense>();

        try // 7. Fixed error handling
        {
            using var conn = new SqlConnection(_connString); // 2. Fixed connection type
            using var cmd = new SqlCommand(
                "SELECT Id, UserId, Amount, Category, Date FROM Expenses WHERE UserId = @UserId", conn); // 4. Fixed SQL injection risk

            cmd.Parameters.AddWithValue("@UserId", userId); // 4. Fixed parameterized query

            await conn.OpenAsync(); // 5. Fixed async operation

            using var reader = await cmd.ExecuteReaderAsync(); // 6. Fixed resource disposal
            while (await reader.ReadAsync()) // 3. Fixed input validation
            {
                var idOrdinal = reader.GetOrdinal("Id");
                var userIdOrdinal = reader.GetOrdinal("UserId");
                var categoryOrdinal = reader.GetOrdinal("Category");
                var amountOrdinal = reader.GetOrdinal("Amount");
                var dateOrdinal = reader.GetOrdinal("Date");

                var id = reader.IsDBNull(idOrdinal) ? 0 : reader.GetInt32(idOrdinal);
                var uId = reader.IsDBNull(userIdOrdinal) ? string.Empty : reader.GetString(userIdOrdinal);
                var category = reader.IsDBNull(categoryOrdinal) ? string.Empty : reader.GetString(categoryOrdinal);
                var amount = reader.IsDBNull(amountOrdinal) ? 0 : reader.GetDecimal(amountOrdinal);
                var date = reader.IsDBNull(dateOrdinal)
                    ? DateOnly.MinValue
                    : DateOnly.FromDateTime(reader.GetDateTime(dateOrdinal));

                expenses.Add(new Expense(id, uId, category, amount, date));
            }
            return Ok(expenses);
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Database error while fetching expenses for user {UserId}", userId);
            return StatusCode(500, "Database error occurred.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while fetching expenses for user {UserId}", userId);
            return StatusCode(500, "Unexpected error occurred.");
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Expense expense)
    {
        if (expense == null || string.IsNullOrWhiteSpace(expense.UserId) || string.IsNullOrWhiteSpace(expense.Category)) // 3. Fixed input validation
            return BadRequest("Invalid expense data.");

        var newExpense = new Expense(
             0,
             expense.UserId,
             expense.Category,
             expense.Amount,
             DateOnly.FromDateTime(DateTime.Now)
        );

        try // 7. Fixed error handling
        {
            using var conn = new SqlConnection(_connString);
            using var cmd = new SqlCommand(
                "INSERT INTO Expenses (UserId, Amount, Category, Date) VALUES (@UserId, @Amount, @Category, @Date)", conn); // 4. Fixed SQL injection risk

            // 4. Fixed parameterized query
            cmd.Parameters.AddWithValue("@UserId", newExpense.UserId);
            cmd.Parameters.AddWithValue("@Amount", newExpense.Amount); 
            cmd.Parameters.AddWithValue("@Category", newExpense.Category); 
            cmd.Parameters.AddWithValue("@Date", newExpense.Date);

            // 5. Fixed async operation
            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync(); 

            return CreatedAtAction(nameof(GetAll), new { userId = newExpense.UserId }, newExpense); // 8. Fixed REST response
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Database error while creating expense for user {UserId}", newExpense.UserId);
            return StatusCode(500, "Database error occurred.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while creating expense for user {UserId}", newExpense.UserId);
            return StatusCode(500, "Unexpected error occurred.");
        }
    }

}