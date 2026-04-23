using Microsoft.AspNetCore.Mvc;
using SeniorDeveloperHiringTest_SaiRam.Models;


[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{

    [HttpGet]
    public IActionResult GetAll(
        [FromQuery] string userId,
        [FromQuery] string? category = null,
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return BadRequest(new { message = "UserId is required." });

        var query = DataStore.Expenses.Where(e => e.UserId == userId);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(e => string.Equals(e.Category, category, StringComparison.OrdinalIgnoreCase));

        if (DateOnly.TryParse(startDate, out var start))
            query = query.Where(e => e.Date >= start);

        if (DateOnly.TryParse(endDate, out var end))
            query = query.Where(e => e.Date <= end);

        var result = query
            .OrderByDescending(e => e.Date)
            .ToList();

        return Ok(result);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateExpenseRequest req)
    {
        if (req == null)
            return BadRequest(new { message = "Request body is required." });
        if (string.IsNullOrWhiteSpace(req.UserId))
            return BadRequest(new { message = "UserId is required." });
        if (string.IsNullOrWhiteSpace(req.Category))
            return BadRequest(new { message = "Category is required." });
        if (req.Amount <= 0)
            return BadRequest(new { message = "Amount must be greater than 0." });
        if (req.Date > DateOnly.FromDateTime(DateTime.UtcNow))
            return BadRequest(new { message = "Date cannot be in the future." });

        var expense = new Expense(
            DataStore.NextId(),
            req.UserId,
            req.Category,
            req.Amount,
            req.Date
        );

        lock (DataStore.Expenses)
        {
            DataStore.Expenses.Add(expense);
        }

        return Created(string.Empty, expense);
    }

    [HttpGet("summary")]
    public IActionResult GetSummary([FromQuery] string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return BadRequest(new { message = "UserId is required." });
        var expenses = DataStore.Expenses
            .Where(e => e.UserId == userId)
            .ToList();
        var totals = expenses
            .GroupBy(e => e.Category)
            .ToDictionary(
                g => g.Key,
                g => Math.Round(g.Sum(x => x.Amount), 2)
            );
        var grandTotal = Math.Round(
            expenses.Sum(e => e.Amount),
            2
        );

        return Ok(new
        {
            totals,
            grandTotal
        });
    }
}