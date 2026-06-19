import React, { useState, useEffect } from "react";
import { Contact, CategoryType, StatusType } from "../types";
import { X, Save, AlertCircle } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  contact: Contact | null; // Null means "Create New"
  onClose: () => void;
  onSave: (contact: Contact) => void;
}

const CATEGORIES: CategoryType[] = [
  "School Counselor",
  "Therapist",
  "Parent Organization",
  "Church",
  "Youth Nonprofit",
  "Community Center",
];

const STATUSES: StatusType[] = [
  "New",
  "Attempted Contact",
  "In Discussion",
  "Connected",
  "Follow-up Needed",
  "Not Interested",
];

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  contact,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Omit<Contact, "id">>({
    organization: "",
    contactName: "",
    title: "",
    email: "",
    phoneNumber: "",
    category: "School Counselor",
    status: "New",
    lastContactDate: "",
    followUp: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contact) {
      setFormData({
        organization: contact.organization,
        contactName: contact.contactName,
        title: contact.title,
        email: contact.email,
        phoneNumber: contact.phoneNumber,
        category: contact.category,
        status: contact.status,
        lastContactDate: contact.lastContactDate,
        followUp: contact.followUp,
      });
    } else {
      setFormData({
        organization: "",
        contactName: "",
        title: "",
        email: "",
        phoneNumber: "",
        category: "School Counselor",
        status: "New",
        lastContactDate: "",
        followUp: "",
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.organization.trim()) tempErrors.organization = "Organization name is required.";
    if (!formData.contactName.trim()) tempErrors.contactName = "Contact name is required.";
    if (!formData.title.trim()) tempErrors.title = "Contact's professional title is required.";
    
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        tempErrors.email = "Please enter a valid email format.";
      }
    } else {
      tempErrors.email = "Email address is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error on type
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: contact ? contact.id : `custom-${Date.now()}`,
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-editorial-ink/70 backdrop-blur-3xs">
      <div 
        className="relative bg-white border border-editorial-linen w-full max-w-2xl transform transition-all duration-200 outline-hidden"
        role="dialog"
        aria-modal="true"
        id="contact-editing-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-editorial-linen/40 p-5 bg-editorial-board">
          <h3 className="text-lg font-serif font-bold text-editorial-ink" id="modal-title">
            {contact ? "Edit Registry Record" : "Add Community Catalog Entry"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-editorial-mud hover:text-editorial-ink hover:bg-editorial-sand/40 transition-colors cursor-pointer"
            id="close-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organization */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink font-semibold block">
                Organization / Facility *
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="e.g. Oakridge High School, Hope Fellowship"
                className={`w-full px-3 py-2 text-xs border focus:outline-hidden focus:border-editorial-ink transition-colors ${
                  errors.organization ? "border-rose-450 bg-rose-50/20" : "border-editorial-linen"
                }`}
                id="field-organization"
              />
              {errors.organization && (
                <p className="text-[10px] font-serif italic text-rose-800 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.organization}
                </p>
              )}
            </div>

            {/* Contact Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink font-semibold block">
                Contact Full Name *
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="e.g. Dr. Angela Martin"
                className={`w-full px-3 py-2 text-xs border focus:outline-hidden focus:border-editorial-ink transition-colors ${
                  errors.contactName ? "border-rose-455 bg-rose-50/20" : "border-editorial-linen"
                }`}
                id="field-contactName"
              />
              {errors.contactName && (
                <p className="text-[10px] font-serif italic text-rose-800 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.contactName}
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink font-semibold block">
                Professional Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Lead Counselor, Child Therapist"
                className={`w-full px-3 py-2 text-xs border focus:outline-hidden focus:border-editorial-ink transition-colors ${
                  errors.title ? "border-rose-455 bg-rose-50/20" : "border-editorial-linen"
                }`}
                id="field-title"
              />
              {errors.title && (
                <p className="text-[10px] font-serif italic text-rose-800 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.title}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink font-semibold block">
                Email Address *
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. amartin@example.com"
                className={`w-full px-3 py-2 text-xs border focus:outline-hidden focus:border-editorial-ink transition-colors ${
                  errors.email ? "border-rose-455 bg-rose-50/20" : "border-editorial-linen"
                }`}
                id="field-email"
              />
              {errors.email && (
                <p className="text-[10px] font-serif italic text-rose-800 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink font-semibold block">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
                placeholder="e.g. (555) 019-2834"
                className="w-full px-3 py-2 text-xs border border-editorial-linen focus:outline-hidden focus:border-editorial-ink transition-colors"
                id="field-phone"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink font-semibold block">
                Sector Track *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-editorial-linen bg-white focus:outline-hidden focus:border-editorial-ink transition-colors cursor-pointer font-mono"
                id="field-category"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink font-semibold block">
                Lead Pipeline Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-editorial-linen bg-white focus:outline-hidden focus:border-editorial-ink transition-colors cursor-pointer font-mono"
                id="field-status"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Last Contact Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink font-semibold block">
                Last Contact Date
              </label>
              <input
                type="date"
                name="lastContactDate"
                value={formData.lastContactDate || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-editorial-linen bg-white focus:outline-hidden focus:border-editorial-ink transition-colors cursor-pointer font-mono"
                id="field-lastContactDate"
              />
            </div>

            {/* Follow-up Notes */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink font-semibold block">
                Follow-up Plan & Actions (Goal details)
              </label>
              <textarea
                name="followUp"
                rows={3}
                value={formData.followUp}
                onChange={handleChange}
                placeholder="e.g. Schedule call for next Tuesday; deliver brochures next month..."
                className="w-full px-3 py-2 text-xs border border-editorial-linen focus:outline-hidden focus:border-editorial-ink transition-colors resize-none font-serif italic"
                id="field-followUp"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-editorial-linen/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-editorial-linen hover:bg-editorial-sand/40 text-xs font-mono uppercase tracking-wider text-editorial-ink transition-colors cursor-pointer"
              id="cancel-modal-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-editorial-ink hover:bg-neutral-800 text-editorial-egg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              id="save-modal-btn"
            >
              <Save className="h-4 w-4" />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
