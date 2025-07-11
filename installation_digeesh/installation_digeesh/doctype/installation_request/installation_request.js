frappe.ui.form.on('Installation Request', {

    onload: function(frm) {
        
        frm.get_field('installation_items').grid.cannot_add_rows = true;
    },

    refresh: function(frm) {
        
        if (frm.doc.workflow_state == 'Approved') {
            frm.add_custom_button(__('Schedule Installation'), function() {
                frappe.call({
                    method: 'installation_digeesh.installation_digeesh.doctype.installation_request.installation_request.schedule_installation',
                    args: {
                        docname: frm.doc.name
                    },
                    callback: function(r) {
                        if (r.message && r.message.success) {
                            frappe.msgprint(" Installation Scheduled");
                            frm.reload_doc();
                        }
                    }
                });
            }).addClass('btn-primary');
        }
    },

    delivery_note: function(frm) {
        if (frm.doc.delivery_note) {
            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    doctype: 'Delivery Note',
                    filters: { name: frm.doc.delivery_note },
                    fieldname: 'customer'
                },
                callback: function(r) {
                    if (r.message?.customer) {
                        frm.set_value('customer', r.message.customer);
                    }
                }
            });

            frm.clear_table('installation_items');
            frappe.call({
                method: 'installation_digeesh.installation_digeesh.doctype.installation_request.installation_request.get_delivery_note_items',
                args: { delivery_note: frm.doc.delivery_note },
                callback: function(r) {
                    if (r.message) {
                        r.message.forEach(item => {
                            const row = frm.add_child('installation_items');
                            row.item_code = item.item_code;
                            row.quantity = item.qty;
                        });
                        frm.refresh_field('installation_items');
                        frm.trigger('calculate_total_quantity');
                    }
                }
            });
        }
    },

    customer: function(frm) {
        if (frm.doc.customer) {
            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    doctype: 'Installation Zone',
                    filters: { customer: frm.doc.customer },
                    fieldname: 'preferred_technician'
                },
                callback: function(r) {
                    if (r.message?.preferred_technician) {
                        frm.set_value('assigned_technician', r.message.preferred_technician);
                    }
                }
            });
        }
    },

    before_submit: function(frm) {
        if (frm.doc.total_quantity > 10) {
            frappe.confirm(
                'Total quantity is more than 10. Do you want to proceed?',
                () => {
                    frappe.call({
                        method: 'installation_digeesh.installation_digeesh.doctype.installation_request.installation_request.confirm_high_quantity_submission',
                        args: { docname: frm.doc.name },
                        callback: function(r) {
                            if (r.message?.success) {
                                frm.reload_doc();
                            }
                        }
                    });
                },
                () => {
                    frappe.validated = false;
                }
            );
            frappe.validated = false;
        }
    },

    calculate_total_quantity: function(frm) {
        let total = 0;
        frm.doc.installation_items.forEach(item => {
            total += item.quantity || 0;
        });
        frm.set_value('total_quantity', total);
    }
});

frappe.ui.form.on('Installation Items', {
    installation_items_add: function(frm) {
        frappe.msgprint('Items are auto-fetched from Delivery Note. Manual addition is not allowed.');
        frm.get_field('installation_items').grid.grid_rows.pop();  
        frm.refresh_field('installation_items');
    },
    quantity: function(frm) {
        frm.trigger('calculate_total_quantity');
    }
});
