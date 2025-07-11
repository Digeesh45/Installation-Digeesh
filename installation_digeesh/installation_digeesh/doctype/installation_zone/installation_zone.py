# Copyright (c) 2025, d and contributors
# For license information, please see license.txt

# import frappe

import frappe
from frappe.model.document import Document

class InstallationZone(Document):
    def validate(self):
        # Validate that the technician is a valid user
        if self.preferred_technician:
            if not frappe.db.exists("User", self.preferred_technician):
                frappe.throw(f"User {self.preferred_technician} does not exist")