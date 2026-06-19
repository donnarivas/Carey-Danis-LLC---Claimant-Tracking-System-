import React, { useState, useMemo } from "react";
import { Contact, CategoryType, StatusType } from "../types";
import { 
  Search, 
  ArrowUpDown, 
  Trash2, 
  Edit, 
  Download, 
  Upload, 
  RotateCcw, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Undo2, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle,
  Mail, 
  PhoneCall,
  Calendar
} from "lucide-react";

interface SpreadsheetGridProps {
  contacts: Contact[];
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onAddContact: () => void;
  onResetContacts: () => void;
  onImportCSV: (file: File) => void;
  onExportCSV: () => void;
  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
  activeCategory: CategoryType | null;
  setActiveCategory: (cat: CategoryType | null) => void;
  activeStatus: StatusType | null;
  setActiveStatus: (st: StatusType | null) => void;
}

type SortField = "organization" | "contactName" | "title" | "email" | "status" | "lastContactDate" | "category" | null;
type SortOrder = "asc" | "desc";

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

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  contacts,
  onEditContact,
  onDeleteContact,
  onAddContact,
  onResetContacts,
  onImportCSV,
  onExportCSV,
  selectedContactId,
  setSelectedContactId,
  activeCategory,
  setActiveCategory,
  activeStatus,
  setActiveStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Filter contacts based on search query, activeCategory, and activeStatus
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Category filter check
      const matchesCategory = activeCategory ? c.category === activeCategory : true;
      // Status filter check
      const matchesStatus = activeStatus ? c.status === activeStatus : true;
      // Search matching details
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q === "" || 
        c.organization.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phoneNumber.replace(/[^\d]/g, "").includes(q) ||
        c.phoneNumber.includes(q) ||
        c.followUp.toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [contacts, searchQuery, activeCategory, activeStatus]);

  // Sort filtered contacts
  const sortedContacts = useMemo(() => {
    if (!sortField) return filteredContacts;

    const sorted = [...filteredContacts];
    sorted.sort((a, b) => {
      const fieldA = (a[sortField as keyof Contact] || "").toString().toLowerCase();
      const fieldB = (b[sortField as keyof Contact] || "").toString().toLowerCase();

      if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredContacts, sortField, sortOrder]);

  // Paginate contacts
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedContacts.slice(start, start + pageSize);
  }, [sortedContacts, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedContacts.length / pageSize) || 1;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportCSV(e.target.files[0]);
    }
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Header setting
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(33, 37, 41); // editorial ink
      doc.text("CAREY & DANIS LLC", 15, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(140, 115, 85); // mud accent
      doc.text("COMMUNITY PARTNERS & REGISTERED OUTREACH VECTORS", 15, 25);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}  |  Active Channels Found: ${sortedContacts.length}`, 15, 30);

      // Primary header thin divider
      doc.setDrawColor(218, 224, 233);
      doc.setLineWidth(0.5);
      doc.line(15, 34, 195, 34);

      let y = 43;
      const pageHeight = 297;
      const marginBottom = 20;

      // Table Headers
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text("Organization / School", 15, y);
      doc.text("Contact / Title", 68, y);
      doc.text("Sector Track", 115, y);
      doc.text("Status", 150, y);
      doc.text("Email", 172, y);

      doc.line(15, y + 2, 195, y + 2);
      y += 8;

      sortedContacts.forEach((c) => {
        // Page break check
        if (y > pageHeight - marginBottom) {
          doc.addPage();
          y = 20;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.text("Carey & Danis LLC - Partners Catalog (Continued)", 15, y);
          doc.line(15, y + 2, 195, y + 2);
          y += 10;

          // Header again
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(60, 60, 60);
          doc.text("Organization / School", 15, y);
          doc.text("Contact / Title", 68, y);
          doc.text("Sector Track", 115, y);
          doc.text("Status", 150, y);
          doc.text("Email", 172, y);
          doc.line(15, y + 2, 195, y + 2);
          y += 8;
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(33, 37, 41);

        // Helper to safely truncate strings
        const limitStr = (str: string, limit: number) => {
          const val = str || "";
          return val.length > limit ? val.substring(0, limit - 3) + "..." : val;
        };

        // Render values
        const org = limitStr(c.organization, 28);
        const name = limitStr(c.contactName, 22);
        const title = limitStr(c.title, 22);
        const cat = c.category;
        const stat = c.status;
        const email = limitStr(c.email, 22);

        doc.setFont("helvetica", "bold");
        doc.text(org, 15, y);

        doc.setFont("helvetica", "bold");
        doc.text(name, 68, y);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(110, 110, 110);
        doc.text(title, 68, y + 3.5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(33, 37, 41);
        doc.text(cat, 115, y);

        // Status-specific color formatting
        let statusRGB = [33, 37, 41];
        if (stat === "Connected") statusRGB = [16, 124, 65];
        else if (stat === "Follow-up Needed") statusRGB = [168, 0, 0];
        else if (stat === "Attempted Contact") statusRGB = [180, 110, 0];
        else if (stat === "In Discussion") statusRGB = [140, 120, 0];

        doc.setFont("helvetica", "bold");
        doc.setTextColor(statusRGB[0], statusRGB[1], statusRGB[2]);
        doc.text(stat, 150, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(email, 172, y);

        // Underline line separator
        doc.setDrawColor(242, 240, 236);
        doc.setLineWidth(0.2);
        doc.line(15, y + 5.5, 195, y + 5.5);

        y += 8.5;
      });

      // Save PDF output
      doc.save(`CRM_Partners_Catalog_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF download export failure:", err);
    }
  };

  // Render proper coloring for categories in spreadsheet rows
  const getCategoryBadgeClass = (category: CategoryType) => {
    return "border border-editorial-ink/25 px-2 py-0.5 text-[9.5px] uppercase tracking-wider font-mono text-editorial-ink bg-editorial-egg/40";
  };

  // Render state classes
  const getStatusBadgeClass = (status: StatusType) => {
    switch (status) {
      case "New":
        return "border border-blue-800/30 text-blue-900 bg-blue-50/40 px-2 py-1 text-[9px] uppercase tracking-wide font-mono";
      case "Attempted Contact":
        return "border border-amber-805/40 text-amber-900 bg-amber-50/40 px-2 py-1 text-[9px] uppercase tracking-wide font-mono";
      case "In Discussion":
        return "border border-yellow-800/50 text-yellow-950 bg-yellow-50/40 px-2 py-1 text-[9px] uppercase tracking-wide font-mono";
      case "Connected":
        return "border border-emerald-800/40 text-emerald-900 bg-emerald-50/40 px-2 py-1 text-[9px] uppercase tracking-wide font-mono";
      case "Follow-up Needed":
        return "border border-rose-800/40 text-rose-900 bg-rose-50/45 px-2 py-1 text-[9px] uppercase tracking-wide font-mono animate-pulse";
      case "Not Interested":
        return "border border-editorial-ink/20 text-editorial-mud bg-editorial-sand/40 px-2 py-1 text-[9px] uppercase tracking-wide font-mono";
      default:
        return "border border-editorial-ink/25 text-editorial-ink bg-editorial-sand/20 px-2 py-1 text-[9px] uppercase tracking-wide font-mono";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter selects, and quick actions row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 border border-editorial-linen">
        
        {/* Left Side: Search & Filter indicators */}
        <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3">
          {/* Quick search input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-editorial-mud pointer-events-none" />
            <input
              type="text"
              placeholder="Search by facility, contact, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 text-xs font-serif italic border border-editorial-linen placeholder-editorial-mud/70 focus:outline-hidden focus:border-editorial-ink bg-editorial-egg/30 transition-colors"
              id="spreadsheet-search"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <select
              value={activeCategory || ""}
              onChange={(e) => {
                setActiveCategory(e.target.value ? (e.target.value as CategoryType) : null);
                setCurrentPage(1);
              }}
              className="w-full font-mono uppercase tracking-wider text-[10px] border border-editorial-linen py-2.5 px-3 bg-white text-editorial-ink cursor-pointer outline-hidden focus:border-editorial-ink"
              id="filter-category-select"
            >
              <option value="">-- ALL SECTORS --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}S
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 min-w-[155px]">
            <select
              value={activeStatus || ""}
              onChange={(e) => {
                setActiveStatus(e.target.value ? (e.target.value as StatusType) : null);
                setCurrentPage(1);
              }}
              className="w-full font-mono uppercase tracking-wider text-[10px] border border-editorial-linen py-2.5 px-3 bg-white text-editorial-ink cursor-pointer outline-hidden focus:border-editorial-ink"
              id="filter-status-select"
            >
              <option value="">-- ALL PIPELINES --</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Indicators */}
          {(activeCategory || activeStatus || searchQuery) && (
            <button
              onClick={() => {
                setActiveCategory(null);
                setActiveStatus(null);
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink font-semibold hover:underline transition-colors flex items-center gap-1 shrink-0 px-2 cursor-pointer"
              id="clear-all-filters"
            >
              <Undo2 className="h-3 w-3" />
              Reset filters
            </button>
          )}
        </div>

        {/* Right Side Actions: Import, Export, Add Contact, Reset database */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Add Entry trigger */}
          <button
            onClick={onAddContact}
            className="bg-editorial-ink hover:bg-neutral-800 text-editorial-egg font-serif font-bold text-xs py-2.5 px-4 border border-editorial-ink flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            id="add-entry-trigger"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Partner Row
          </button>

          {/* Export CSV trigger */}
          <button
            onClick={onExportCSV}
            className="border border-editorial-linen bg-white hover:bg-editorial-sand/45 text-editorial-ink font-serif font-semibold text-xs py-2.5 px-3 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Download CSV Spreadsheet file"
            id="export-csv-btn"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>

          {/* Export PDF trigger */}
          <button
            onClick={handleExportPDF}
            className="bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 border border-emerald-300 font-serif font-semibold text-xs py-2.5 px-3 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            title="Download modern PDF Catalog document"
            id="export-pdf-btn"
          >
            <Download className="h-3.5 w-3.5 text-emerald-800" />
            Export PDF
          </button>

          {/* Import CSV trigger */}
          <label className="border border-editorial-linen bg-white hover:bg-editorial-sand/45 text-editorial-ink font-serif font-semibold text-xs py-2.5 px-3 flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="h-3.5 w-3.5" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="import-csv-file"
            />
          </label>

          {/* Reset original database */}
          <button
            onClick={onResetContacts}
            className="border border-rose-300 text-rose-800 hover:bg-rose-50/50 font-serif italic text-xs py-2.5 px-3 flex items-center gap-1 transition-colors cursor-pointer"
            title="Restore original 100 Contacts list"
            id="reset-contacts-btn"
          >
            <RotateCcw className="h-3.5 w-3.5 text-rose-750" />
            Reset DB to 100
          </button>
        </div>
      </div>

      {/* Spreadsheet Table Frame */}
      <div className="bg-white border border-editorial-linen overflow-hidden">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left border-collapse table-fixed select-text">
            <thead>
              <tr className="bg-editorial-board border-b border-editorial-linen text-editorial-ink text-[9px] uppercase font-bold tracking-widest font-mono">
                {/* ID Indicator */}
                <th className="w-12 px-3 py-3.5 text-center text-editorial-mud">#</th>

                {/* Organization */}
                <th 
                  onClick={() => handleSort("organization")}
                  className="w-56 px-4 py-3.5 font-bold cursor-pointer hover:bg-editorial-sand/50 transition-colors select-none"
                  id="h-organization"
                >
                  <div className="flex items-center gap-1">
                    Organization / School
                    <ArrowUpDown className="h-3 w-3 text-editorial-mud" />
                  </div>
                </th>

                {/* Category */}
                <th 
                  onClick={() => handleSort("category")}
                  className="w-44 px-4 py-3.5 font-bold cursor-pointer hover:bg-editorial-sand/50 transition-colors select-none"
                  id="h-category"
                >
                  <div className="flex items-center gap-1">
                    Sector Track
                    <ArrowUpDown className="h-3 w-3 text-editorial-mud" />
                  </div>
                </th>

                {/* Contact Name & Title */}
                <th 
                  onClick={() => handleSort("contactName")}
                  className="w-48 px-4 py-3.5 font-bold cursor-pointer hover:bg-editorial-sand/50 transition-colors select-none"
                  id="h-contact"
                >
                  <div className="flex items-center gap-1">
                    Partner / Title
                    <ArrowUpDown className="h-3 w-3 text-editorial-mud" />
                  </div>
                </th>

                {/* Contact Coordinates */}
                <th 
                  onClick={() => handleSort("email")}
                  className="w-60 px-4 py-3.5 font-bold cursor-pointer hover:bg-editorial-sand/50 transition-colors select-none"
                  id="h-email"
                >
                  <div className="flex items-center gap-1">
                    Communication
                    <ArrowUpDown className="h-3 w-3 text-editorial-mud" />
                  </div>
                </th>

                {/* Pipe Status */}
                <th 
                  onClick={() => handleSort("status")}
                  className="w-38 px-4 py-3.5 font-bold cursor-pointer hover:bg-editorial-sand/50 transition-colors select-none"
                  id="h-status"
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="h-3 w-3 text-editorial-mud" />
                  </div>
                </th>

                {/* Last Contact */}
                <th 
                  onClick={() => handleSort("lastContactDate")}
                  className="w-36 px-4 py-3.5 font-bold cursor-pointer hover:bg-editorial-sand/50 transition-colors select-none"
                  id="h-last-contact"
                >
                  <div className="flex items-center gap-1">
                    Last Contact
                    <ArrowUpDown className="h-3 w-3 text-editorial-mud" />
                  </div>
                </th>

                {/* Follow-up Notes / Goal descriptions */}
                <th className="w-80 px-4 py-3.5 font-bold">
                  Follow-up Plan & Context
                </th>

                {/* Row Actions */}
                <th className="w-24 px-4 py-3.5 text-center font-bold select-none">
                  Row Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-editorial-linen/40 text-xs">
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((c, index) => {
                  const globalRowID = (currentPage - 1) * pageSize + index + 1;
                  const isSelected = selectedContactId === c.id;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedContactId(isSelected ? null : c.id)}
                      className={`group hover:bg-editorial-sand/25 transition-colors cursor-pointer ${
                        isSelected ? "bg-editorial-sand hover:bg-editorial-sand/80 font-medium" : ""
                      }`}
                      id={`row-${c.id}`}
                    >
                      {/* Row Id # */}
                      <td className="px-3 py-4 text-center font-mono text-editorial-mud font-semibold text-[10px]">
                        {globalRowID}
                      </td>

                      {/* Organization Column */}
                      <td className="px-4 py-4 font-bold text-editorial-ink text-xs">
                        <div className="line-clamp-2" title={c.organization}>
                          {c.organization}
                        </div>
                      </td>

                      {/* Category Badge Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex ${getCategoryBadgeClass(c.category)}`}>
                          {c.category}
                        </span>
                      </td>

                      {/* Contact & Title Column */}
                      <td className="px-4 py-4">
                        <div className="font-serif font-bold text-editorial-ink text-sm group-hover:underline transition-all">
                          {c.contactName}
                        </div>
                        <div className="text-[10px] text-editorial-mud font-mono leading-tight mt-0.5 line-clamp-1" title={c.title}>
                          {c.title}
                        </div>
                      </td>

                      {/* Communication Details Column */}
                      <td className="px-4 py-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-editorial-ink/90 hover:underline">
                          <Mail className="h-3 w-3 text-editorial-mud shrink-0" />
                          <span className="truncate" title={c.email}>{c.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-editorial-mud mt-1 text-[10px]">
                          <PhoneCall className="h-3 w-3 text-editorial-mud shrink-0" />
                          <span className="truncate">{c.phoneNumber || "None"}</span>
                        </div>
                      </td>

                      {/* Pipeline Status Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-block text-center min-w-[105px] ${getStatusBadgeClass(c.status)}`}>
                          {c.status}
                        </span>
                      </td>

                      {/* Last Contact Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {c.lastContactDate ? (
                          <div className="flex items-center gap-1.5 text-editorial-ink font-mono text-[11px]">
                            <Calendar className="h-3 w-3 text-editorial-mud" />
                            {c.lastContactDate}
                          </div>
                        ) : (
                          <span className="text-editorial-mud/50 font-serif italic text-[11px]">No contact yet</span>
                        )}
                      </td>

                      {/* Follow-up Notes Column */}
                      <td className="px-4 py-4 text-editorial-ink/80 select-all">
                        <div className="line-clamp-2 text-[11px] leading-relaxed font-serif" title={c.followUp}>
                          {c.followUp || <span className="text-editorial-mud/40 italic">None specified</span>}
                        </div>
                      </td>

                      {/* Edit or Delete Row Actions */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit Row button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditContact(c);
                            }}
                            className="p-1.5 border border-editorial-linen bg-white text-editorial-ink hover:bg-editorial-sand/70 transition-colors cursor-pointer"
                            title="Edit Record"
                            id={`edit-contact-${c.id}`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Row button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteContact(c.id);
                            }}
                            className="p-1.5 border border-rose-200 bg-rose-50/20 text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Record"
                            id={`delete-contact-${c.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-editorial-mud">
                    <div className="flex flex-col items-center justify-center space-y-3 font-serif">
                      <AlertTriangle className="h-8 w-8 text-editorial-linen" />
                      <p className="font-bold text-editorial-ink text-sm">No matched registry records</p>
                      <p className="text-xs max-w-sm italic">Adjust filters above or parse additional partner files to populate the database.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Pagination & metadata metrics */}
        <div className="bg-editorial-board border-t border-editorial-linen p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-editorial-mud font-mono">
          
          {/* Status Counter */}
          <div className="flex items-center gap-2">
            <span>SHOW</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-editorial-linen bg-white px-2 py-1 font-mono uppercase text-editorial-ink text-[11px] outline-hidden cursor-pointer"
              id="page-size-selector"
            >
              <option value="15">15 rows</option>
              <option value="25">25 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
              <option value="150">150 rows</option>
            </select>
            <span className="text-[11px]">
              OF <strong className="text-editorial-ink">{sortedContacts.length}</strong> KEY CHANNELS LOGGED
              {contacts.length !== sortedContacts.length && (
                <> (TOTAL DATABASE SIZE: <strong className="text-editorial-ink">{contacts.length}</strong>)</>
              )}
            </span>
          </div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 px-3.5 border border-editorial-linen bg-white text-editorial-ink hover:bg-editorial-sand/55 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer transition-colors text-[10px]"
                id="prev-page-btn"
              >
                PREV
              </button>
              
              <div className="font-serif italic font-semibold px-2">
                Page <span className="font-sans font-bold not-italic">{currentPage}</span> of <span className="font-sans font-bold not-italic">{totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 px-3.5 border border-editorial-linen bg-white text-editorial-ink hover:bg-editorial-sand/55 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer transition-colors text-[10px]"
                id="next-page-btn"
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
