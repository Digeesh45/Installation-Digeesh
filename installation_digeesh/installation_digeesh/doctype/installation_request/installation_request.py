import frappe
from frappe.model.document import Document

class InstallationRequest(Document):
    def validate(self):
        self.validate_delivery_note()
        self.set_customer_from_delivery_note()
        self.set_assigned_technician()
        self.fetch_items_from_delivery_note()
        self.calculate_total_quantity()
        self.validate_total_quantity()

    def validate_delivery_note(self):
        if self.delivery_note:
            dn = frappe.get_doc("Delivery Note", self.delivery_note)
            if dn.docstatus != 1:
                frappe.throw("Selected Delivery Note must be submitted.")

    def set_customer_from_delivery_note(self):
        if self.delivery_note and not self.customer:
            self.customer = frappe.get_value("Delivery Note", self.delivery_note, "customer")

    def set_assigned_technician(self):
        if self.customer and not self.assigned_technician:
            technician = frappe.get_value(
                "Installation Zone", 
                {"customer": self.customer}, 
                "preferred_technician"
            )
            if technician:
                self.assigned_technician = technician

    def fetch_items_from_delivery_note(self):
        if self.delivery_note and not self.installation_items:
            dn_items = frappe.get_all("Delivery Note Item", 
                filters={"parent": self.delivery_note},
                fields=["item_code", "qty"]
            )
            for item in dn_items:
                self.append("installation_items", {
                    "item_code": item.item_code,
                    "quantity": item.qty
                })

    def calculate_total_quantity(self):
        total = 0
        for item in self.installation_items:
            if item.quantity:
                total += item.quantity
        self.total_quantity = total

    def validate_total_quantity(self):
        if self.total_quantity > 10:
            frappe.msgprint(
                " Total quantity is more than 10. Please confirm before submission.",
                title="High Quantity Warning",
                indicator="orange"
            )

    def before_submit(self):
        if self.total_quantity > 10:
            frappe.throw("Total quantity exceeds 10. Confirm manually before submitting.")


@frappe.whitelist()
def schedule_installation(docname):
    doc = frappe.get_doc("Installation Request", docname)

    if doc.docstatus != 1:
        frappe.throw("Installation Request must be submitted first.")

    if doc.status == "Scheduled":
        frappe.throw("Already Scheduled.")

    doc.status = "Scheduled"
    doc.save(ignore_permissions=True)  
    frappe.db.commit()

    frappe.msgprint("Installation has been scheduled.")
    return {"success": True}


@frappe.whitelist()
def get_delivery_note_items(delivery_note):
    if not delivery_note:
        return []
    return frappe.get_all(
        "Delivery Note Item",
        filters={"parent": delivery_note},
        fields=["item_code", "qty", "item_name"]
    )

@frappe.whitelist()
def confirm_high_quantity_submission(docname):
    doc = frappe.get_doc("Installation Request", docname)
    doc.submit()
    frappe.msgprint("Installation Request submitted successfully.")
    return {"success": True}
