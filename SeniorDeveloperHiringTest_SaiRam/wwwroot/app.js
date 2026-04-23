const expenseTracker = {
    userId: null,
    allExpenses: [],
    expenses: [],
    categories: new Set(),

    init(userId) {
        this.userId = userId;

        document.getElementById('category-filter')
            .addEventListener('change', () => this.applyFilters());

        document.getElementById('start-date')
            .addEventListener('change', () => this.applyFilters());

        document.getElementById('end-date')
            .addEventListener('change', () => this.applyFilters());

        document.getElementById('add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        this.fetchExpenses();
    },

    async fetchExpenses() {
        try {
            const stored = sessionStorage.getItem('expenses');

            if (stored) {
                this.allExpenses = JSON.parse(stored);
            } else {
                const res = await fetch(`/api/expenses?userId=${this.userId}`);
                if (!res.ok) throw new Error();

                this.allExpenses = await res.json();
                sessionStorage.setItem('expenses', JSON.stringify(this.allExpenses));
            }

            this.expenses = [...this.allExpenses];

            this.updateCategories();
            this.renderExpenses();
            this.updateSummary();

        } catch {
            this.showError('Failed to load expenses');
        }
    },

    applyFilters() {
        const category = document.getElementById('category-filter').value;
        const startVal = document.getElementById('start-date').value;
        const endVal = document.getElementById('end-date').value;

        const start = startVal ? new Date(startVal) : null;
        const end = endVal ? new Date(endVal) : null;

        if (end) end.setHours(23, 59, 59, 999);

        this.expenses = this.allExpenses.filter(exp => {
            const expDate = new Date(exp.date);

            if (category && exp.category !== category) return false;
            if (start && expDate < start) return false;
            if (end && expDate > end) return false;

            return true;
        });

        this.renderExpenses();
        this.updateSummary();
    },

    updateSummary() {
        const container = document.getElementById('summary-content');
        container.innerHTML = '';

        const totals = {};
        let grandTotal = 0;

        this.expenses.forEach(exp => {
            totals[exp.category] =
                (totals[exp.category] || 0) + exp.amount;

            grandTotal += exp.amount;
        });

        Object.entries(totals).forEach(([cat, total]) => {
            const p = document.createElement('p');
            p.textContent = `${cat}: $${total.toFixed(2)}`;
            container.appendChild(p);
        });

        const strong = document.createElement('strong');
        strong.textContent = `Total: $${grandTotal.toFixed(2)}`;
        container.appendChild(strong);
    },

    updateCategories() {
        this.categories = new Set(
            this.allExpenses.map(e => e.category).filter(Boolean)
        );

        const filter = document.getElementById('category-filter');
        const current = filter.value;

        filter.innerHTML = '<option value="">All Categories</option>';

        this.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            filter.appendChild(opt);
        });

        filter.value = current;
    },

    renderExpenses() {
        const list = document.getElementById('expense-list');
        list.innerHTML = '';

        if (this.expenses.length === 0) {
            list.innerHTML = '<li>No expenses found.</li>';
            return;
        }

        this.expenses.forEach(exp => {
            const li = document.createElement('li');
            li.textContent =
                `${exp.date.slice(0, 10)} | ${exp.category}: $${exp.amount.toFixed(2)}`;
            list.appendChild(li);
        });
    },

    async addExpense() {
        this.clearFormErrors();

        const category = document.getElementById('category-input').value.trim();
        const amountStr = document.getElementById('amount-input').value;
        const dateStr = document.getElementById('date-input').value;

        let valid = true;
        let amount = parseFloat(amountStr);

        if (!category) {
            this.setFieldError('category', 'Category is required.');
            valid = false;
        }

        if (isNaN(amount) || amount <= 0) {
            this.setFieldError('amount', 'Amount must be positive.');
            valid = false;
        }

        if (!dateStr) {
            this.setFieldError('date', 'Date is required.');
            valid = false;
        }

        if (!valid) return;

        const req = {
            userId: this.userId,
            category,
            amount,
            date: dateStr
        };

        try {
            const newExpense = await api.createExpense(req);

            this.allExpenses.unshift(newExpense);

            sessionStorage.setItem('expenses', JSON.stringify(this.allExpenses));

            this.applyFilters();
            this.updateCategories();

            document.getElementById('add-form').reset();

        } catch (err) {
            this.setFormApiError(err.message || 'Failed to add expense.');
        }
    },

    setFieldError(field, msg) {
        document.getElementById(`${field}-error`).textContent = msg;
    },

    setFormApiError(msg) {
        document.getElementById('form-api-error').textContent = msg;
    },

    clearFormErrors() {
        ['category', 'amount', 'date'].forEach(f => this.setFieldError(f, ''));
        this.setFormApiError('');
    },

    showError(msg) {
        alert(msg);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    expenseTracker.init('user-1');
});

const api = {
    createExpense: (data) =>
        fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) return r.json().then(e => { throw new Error(e.message); });
            return r.json();
        })
};