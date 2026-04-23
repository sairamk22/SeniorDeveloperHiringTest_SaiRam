Question

You are designing a multi-user saas web expense tracking application for small companies up through enterprise sized companies. The requirements are:

- Each employee can log and view their own expenses.
- Managers can view and approve or reject expenses for their direct reports.
- The Finance teams can view all expenses across their organizational units or possibly the whole company and run reports.
- Expenses can have an attached receipt image (photo or PDF), and may need custom fields or tags.

**Address the following:**

1. Identity the key risks related to such an application and a brief description on possible ways to mitigate those risks.
2. Briefly describe a likely tech stack that you would envision would be needed to support this application.



**Answer:**

This is a standard  enterprise SaaS application with a lot of moving parts the hard part is getting the access model right.
The product will only work if employees, managers, and finance see exactly the right slice of data, and if every change is traceable. 

The key risks and mitigations are as follows:

1.Tenant isolation failures
This is the biggest risk because a cross-tenant data leak would be a serious security issue and could completely damage trust in the product.

To mitigate this implement strict tenant isolation at the database and application layers so each company’s data is always scoped correctly and cannot be accessed across tenants

2. Access control mistakes
Employees should only see their own expenses, managers should only see their direct reports, and finance should have broader access.This could get tricky if the reporting lines change

To mitigate this Use RBAC with scope-based rules so each role only gets access to the data it needs, and keep the authorization logic centralized so it stays consistent as the organization changes.

3. Broken approval flow
If expense states can be modified after approval or if users can edit these approved records without trace could lead to fraud and accounting issues.

To mitigate this risk, the expense process should follow a clear lifecycle, once an expense moves into a submitted, approved, or rejected state, it should be locked from direct edits and remain fully auditable.

4. Compliance and Data Privacy
Handling sensitive financial data requires compliance with regulations like GDPR and failure to comply can lead to legal issues and penalities.

To mitigiate this, ensure that the application has data protection measures in place, including encryption, access controls, and regular audits. Also, provide clear privacy policies and obtain necessary consents from users.

5. Receipt handling risk.
The receipts contain sensitive information and uploading and storing them securely is critical.

To mitigate this, use secure storage solutions like Azure Blob Storage or AWS S3 with encryption at rest and in transit.Also implement strict access controls to ensure only authorized users can access the receipts.

6. Reporting accuracy
Finance depends on correct numbers, so bad reporting can lead to poor business decisions.

To mitigate this, use transcational model to build reports and data validation at the point of entry. Also ensure that all changes to expenses are logged and auditable.

7. False and Duplicate Claims
Users can submit the same expenses again or submit false claims which can lead to financial losses.

To mitigate this, implement duplicate detection logic based on key fields like amount, date etc along with policy checks.

8. File Upload and Storage Risks
The file upload feature can introduce malware if not handled properly, and storing large files can lead to cost and performance issues.

To mitigate this, implement file type and size restrictions, and use a secure file storage service with built-in malware scanning.

9. Performance and Scalability
As the number of companies, users, and expenses grows, the app may run into performance issues, especially with reporting and large file uploads.

To mitigate this, design the app for scale with efficient queries, caching, and background jobs for heavy work. Use cloud scaling where needed and offload expensive tasks to workers or serverless functions.


**Likely Stack:**

This is the stack I would choose for this application:

Frontend: React with Next.js, TypeScript, Redux or Zustand for state management, and Tailwind CSS.

Frontend testing: React Testing Library, Jest, and Storybook.

Cache: Azure Cache for Redis, with in-memory caching for local short-lived reads.

Backend: ASP.NET Core Web API with Entity Framework Core for data access.

Backend testing: NUnit, Moq, AutoFixture, and FluentValidation.

Database: SQL Server on Azure SQL Database.

Storage: Azure Blob Storage for receipts and attachments.

Authentication: Microsoft Entra External ID for user authentication.

Authorization: Role-based access control (RBAC) with scope-based rules.

Hosting: Azure App Service for the web app and API.

Monitoring: Application Insights for logs, metrics, and error tracking.

CI/CD: Azure DevOps.

Reporting: Power BI.

Background jobs: Azure Functions or worker services for heavy tasks like report generation and file handling.