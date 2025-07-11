<h2 style="color: #0b5394;">Installation Scheduled</h2>

<p>Hello <b>{{ doc.assigned_technician }}</b>,</p>

<p>The installation request <b>{{ doc.name }}</b> has been scheduled.</p>

<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
    <tr style="background-color: #f2f2f2;">
        <th>Customer</th>
        <th>Delivery Note</th>
        <th>Total Quantity</th>
    </tr>
    <tr>
        <td>{{ doc.customer }}</td>
        <td>{{ doc.delivery_note }}</td>
        <td>{{ doc.total_quantity }}</td>
    </tr>
</table>

<p>Please proceed with the installation at your scheduled time.</p>

<p style="color: gray;">Sent by Frappe ERP</p>
