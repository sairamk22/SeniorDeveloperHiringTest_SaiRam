const expenseTracker = {
    userId: null,
    expenses: [],

    init(userId) {
        this.userId = userId;

        document.getElementById('add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        document.getElementById('category-filter').addEventListener('change', () => {
            this.loadExpenses();
        });

        document.getElementById('start-date').addEventListener('change', () => {
            this.loadExpenses();
        });

        document.getElementById('end-date').addEventListener('change', () => {
            this.loadExpenses();
        });

        this.loadExpenses();
        this.loadSummary();
    },

    async loadExpenses() {
        const category = document.getElementById('category-filter').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        // 6. URL encode query parameters
        const params = new URLSearchParams({
            userId: this.userId,
            category,
            startDate,
            endDate
        });

        try {
            // 2. Error handling for fetch
            const res = await fetch(`/api/expenses?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to load expenses');
            const data = await res.json();
            this.expenses = data;
            this.renderExpenses();
        } catch (err) {
            this.showError('Could not load expenses.');
        }
    },

    async addExpense() {
        const category = document.getElementById('category-input').value.trim();
        const amount = parseFloat(document.getElementById('amount-input').value);
        const date = document.getElementById('date-input').value;

        // 3. Input validation before sending data
        if (!category || isNaN(amount) || amount <= 0 || !date) {
            this.showError('Please enter valid expense details.');
            return;
        }

        try {
            // 5. Set Content-Type header on POST
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.userId, category, amount, date }),
            });
            if (!res.ok) throw new Error('Failed to add expense');
            const newExpense = await res.json();
            this.expenses.push(newExpense);
            this.renderExpenses();
            this.loadSummary();
            document.getElementById('add-form').reset();
        } catch (err) {
            this.showError('Could not add expense.');
        }
    },

    renderExpenses() {
        const list = document.getElementById('expense-list');
        list.innerHTML = '';
        // 7. Handling for empty states
        if (this.expenses.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = 'No expenses found.';
            list.appendChild(emptyItem);
            return;
        }
        this.expenses.forEach(expense => {
            const item = document.createElement('li');
            //1. Use textContent for plain text and prevent XSS
            item.textContent = `${expense.category}: $${expense.amount} — ${expense.date}`;
            list.appendChild(item);
        });
    },

    async loadSummary() {
        try {
            const res = await fetch(`/api/expenses/summary?userId=${encodeURIComponent(this.userId)}`);
            if (!res.ok) throw new Error('Failed to load summary');
            const data = await res.json();
            const container = document.getElementById('summary-content');
            container.innerHTML = '';
            Object.entries(data.totals).forEach(([cat, total]) => {
                const p = document.createElement('p');
                p.textContent = `${cat}: $${total.toFixed(2)}`;
                container.appendChild(p);
            });
            const strong = document.createElement('strong');
            strong.textContent = `Total: $${data.grandTotal.toFixed(2)}`;
            container.appendChild(strong);
        } catch (err) {
            this.showError('Could not load summary.');
        }
    },

    // 4. User feedback on errors
    showError(message) {
        alert(message); // For production, use a better UI notification
    },
};