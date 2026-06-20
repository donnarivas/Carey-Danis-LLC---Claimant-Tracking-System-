import React, { useState, useEffect, useMemo } from "react";
import { Contact, CRMStats, CategoryType, StatusType } from "./types";
import { INITIAL_CONTACTS } from "./data/contacts";
import { StatsRibbon } from "./components/StatsRibbon";
import { TimelineTrends } from "./components/TimelineTrends";
import { SpreadsheetGrid } from "./components/SpreadsheetGrid";
import { ContactModal } from "./components/ContactModal";
import { OutreachPanel } from "./components/OutreachPanel";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  HelpCircle, 
  Sparkles, 
  FileSpreadsheet, 
  BookMarked,
  Layers, 
  Info,
  CheckCircle2
} from "lucide-react";

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  // Filtering states managed globally to sync Ribbon and Table
  const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);
  const [activeStatus, setActiveStatus] = useState<StatusType | null>(null);

  // Modal active states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null); // null means adding new

  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Load contacts from local storage on mount - normalized to New status as requested
  useEffect(() => {
    const saved = localStorage.getItem("crm_contacts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Contact[];
        // Normalized statuses to "New"
        const normalizedParsed = parsed.map((c: any) => ({
          ...c,
          status: "New" as StatusType,
          lastContactDate: ""
        }));

        // Merge with any newly added INITIAL_CONTACTS from contacts.ts that don't exist by id
        const merged = [...normalizedParsed];
        INITIAL_CONTACTS.forEach((initC) => {
          if (!merged.some((m) => m.id === initC.id)) {
            merged.push({
              ...initC,
              status: "New",
              lastContactDate: ""
            });
          }
        });

        // Ensure that contacts with 'gt-', 'har-', 'lmu-', 'cpp-' or 'sfsu-' in their id are at the very beginning
        const priority = merged.filter((c) => c.id.startsWith("gt-") || c.id.startsWith("har-") || c.id.startsWith("lmu-") || c.id.startsWith("cpp-") || c.id.startsWith("sfsu-"));
        const others = merged.filter((c) => !c.id.startsWith("gt-") && !c.id.startsWith("har-") && !c.id.startsWith("lmu-") && !c.id.startsWith("cpp-") && !c.id.startsWith("sfsu-"));
        const reordered = [...priority, ...others];

        setContacts(reordered);
        localStorage.setItem("crm_contacts", JSON.stringify(reordered));
      } catch (e) {
        setContacts(INITIAL_CONTACTS);
        localStorage.setItem("crm_contacts", JSON.stringify(INITIAL_CONTACTS));
      }
    } else {
      setContacts(INITIAL_CONTACTS);
      localStorage.setItem("crm_contacts", JSON.stringify(INITIAL_CONTACTS));
    }
  }, []);

  // Save contacts to local storage on change
  const saveContactsState = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem("crm_contacts", JSON.stringify(newContacts));
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Calculate stats
  const stats = useMemo<CRMStats>(() => {
    const byCategory: Record<CategoryType, number> = {
      "School Counselor": 0,
      "Therapist": 0,
      "Parent Organization": 0,
      "Church": 0,
      "Youth Nonprofit": 0,
      "Community Center": 0,
    };

    const byStatus: Record<StatusType, number> = {
      "New": 0,
      "Attempted Contact": 0,
      "In Discussion": 0,
      "Connected": 0,
      "Follow-up Needed": 0,
      "Not Interested": 0,
    };

    contacts.forEach((c) => {
      if (byCategory[c.category] !== undefined) byCategory[c.category]++;
      if (byStatus[c.status] !== undefined) byStatus[c.status]++;
    });

    const followUpsCount = contacts.filter((c) => c.status === "Follow-up Needed").length;

    return {
      total: contacts.length,
      byCategory,
      byStatus,
      followUpsCount,
    };
  }, [contacts]);

  // Retrieve active contact object for outreach helper
  const selectedContact = useMemo(() => {
    if (!selectedContactId) return null;
    return contacts.find((c) => c.id === selectedContactId) || null;
  }, [selectedContactId, contacts]);

  // Handle Editing an existing contact row
  const handleEditContactClick = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  // Handle Adding a new contact row
  const handleAddContactClick = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  // Save changes from modal (Add / Edit)
  const handleSaveContact = (savedContact: Contact) => {
    const idx = contacts.findIndex((c) => c.id === savedContact.id);
    let updated: Contact[] = [];
    if (idx > -1) {
      updated = [...contacts];
      updated[idx] = savedContact;
      showToast(`Contact "${savedContact.contactName}" updated successfully.`);
    } else {
      updated = [savedContact, ...contacts];
      showToast(`New contact "${savedContact.contactName}" added dynamically.`);
    }
    saveContactsState(updated);
    setIsModalOpen(false);
  };

  // Delete a contact row
  const handleDeleteContact = (id: string) => {
    const toDelete = contacts.find((c) => c.id === id);
    if (!toDelete) return;

    if (window.confirm(`Are you sure you want to delete "${toDelete.contactName}" from the CRM Database?`)) {
      const updated = contacts.filter((c) => c.id !== id);
      saveContactsState(updated);
      showToast(`Removed entry for "${toDelete.contactName}".`, "success");
      if (selectedContactId === id) {
        setSelectedContactId(null);
      }
    }
  };

  // Reset original database of 100 contacts
  const handleResetContacts = () => {
    if (window.confirm("Are you sure you want to restore the spreadsheet to the original pre-populated 100 contacts list? All your custom manual edits will be overwritten.")) {
      saveContactsState(INITIAL_CONTACTS);
      setSelectedContactId(null);
      setActiveCategory(null);
      setActiveStatus(null);
      showToast("Successfully restored CRM back to the primary 100 contacts repository.", "success");
    }
  };

  // Quick Inline Status Update from the outreach panel
  const handleUpdateStatusInline = (id: string, newStatus: StatusType) => {
    const updated = contacts.map((c) => {
      if (c.id === id) {
        return { ...c, status: newStatus, lastContactDate: new Date().toISOString().slice(0, 10) };
      }
      return c;
    });
    saveContactsState(updated);
    showToast(`Status updated to "${newStatus}" & last contact date set to today.`, "success");
  };

  // Export spreadsheet as .CSV download
  const handleExportCSV = () => {
    const headers = [
      "Organization",
      "Contact Name",
      "Title",
      "Email",
      "Phone Number",
      "Category",
      "Status",
      "Last Contact Date",
      "Follow-up Plan"
    ];

    const rows = contacts.map((c) => [
      c.organization,
      c.contactName,
      c.title,
      c.email,
      c.phoneNumber,
      c.category,
      c.status,
      c.lastContactDate,
      c.followUp
    ]);

    const csvString = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((val) => `"${(val || "").toString().replace(/"/g, '""')}"`).join(",")
      )
    ].join("\r\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CRM_Partners_Catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("CSV dataset exported successfully.", "success");
  };

  // Read and parse imported .CSV file
  const handleImportCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/);
        const importedContacts: Contact[] = [];
        
        // Skip header and parse lines
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split by comma ignoring commas inside quotes
          const regex = /("([^"\\]*(?:\\.[^"\\]*)*)"|([^,\r\n]+)|(?=,|\r?\n|\r|$))/g;
          const matches = [];
          let match;
          while ((match = regex.exec(line)) !== null) {
            // Pick up matched group 2 (inside quotes) or group 3 (unquoted)
            if (match[2] !== undefined) {
              matches.push(match[2].replace(/""/g, '"'));
            } else if (match[3] !== undefined) {
              matches.push(match[3].trim());
            } else {
              matches.push("");
            }
          }

          if (matches.length < 4) continue; // Skip lines with too little information

          const org = matches[0] || "Unknown Organization";
          const name = matches[1] || "Unnamed Contact";
          const title = matches[2] || "Representative";
          const email = matches[3] || "no-email@example.com";
          const phone = matches[4] || "";
          
          // Match category from string
          let category: CategoryType = "School Counselor";
          const catStr = (matches[5] || "").toLowerCase();
          if (catStr.includes("therapist")) category = "Therapist";
          else if (catStr.includes("parent") || catStr.includes("pta") || catStr.includes("family")) category = "Parent Organization";
          else if (catStr.includes("church") || catStr.includes("pastor") || catStr.includes("faith")) category = "Church";
          else if (catStr.includes("nonprofit") || catStr.includes("youth") || catStr.includes("alliance")) category = "Youth Nonprofit";
          else if (catStr.includes("community") || catStr.includes("center") || catStr.includes("civic")) category = "Community Center";

          // Match status from string
          let status: StatusType = "New";
          const statStr = (matches[6] || "").toLowerCase();
          if (statStr.includes("attempt") || statStr.includes("try")) status = "Attempted Contact";
          else if (statStr.includes("discuss") || statStr.includes("prog")) status = "In Discussion";
          else if (statStr.includes("connect") || statStr.includes("partner")) status = "Connected";
          else if (statStr.includes("follow") || statStr.includes("need")) status = "Follow-up Needed";
          else if (statStr.includes("interested") || statStr.includes("not")) status = "Not Interested";

          const lastDate = matches[7] || "";
          const followUp = matches[8] || "";

          importedContacts.push({
            id: `imported-${Date.now()}-${i}`,
            organization: org,
            contactName: name,
            title,
            email,
            phoneNumber: phone,
            category,
            status,
            lastContactDate: lastDate,
            followUp,
          });
        }

        if (importedContacts.length > 0) {
          const combined = [...importedContacts, ...contacts];
          saveContactsState(combined);
          showToast(`Successfully parsed and appended ${importedContacts.length} spreadsheet records!`, "success");
        } else {
          showToast("No valid rows detected in the uploaded CSV. Ensure format is matching.", "error");
        }
      } catch (err) {
        showToast("Error processing the CSV file. Please inspect structure.", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-editorial-egg pb-16 outline-hidden text-editorial-ink selection:bg-editorial-linen selection:text-editorial-ink">
      
      {/* Toast Notification Trigger */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-sm w-full px-4"
          >
            <div className={`p-4 border text-xs font-serif flex items-center gap-2.5 shadow-xs ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-800 shrink-0" />
              <span className="tracking-wide font-medium">{toastMessage.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Header Segment - Editorial Style */}
      <header className="bg-editorial-board border-b border-editorial-linen sticky top-0 z-10 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="editorial-badge">Dossier</span>
              <span className="text-xs uppercase tracking-widest font-mono text-editorial-mud">v1.1</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-editorial-ink tracking-tight">
              CRM Spreadsheet Workspace
            </h1>
            <p className="text-sm font-serif italic text-editorial-mud max-w-2xl">
              A meticulously organized workspace cataloging 100 pivotal community partners across key sectors to coordinate counselor, therapeutic, and parent organization outreach.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto font-mono text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-editorial-linen bg-white/50 text-editorial-ink">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Syncing Local Sandbox</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Statistics Ribbon & Timeline Trends Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <StatsRibbon
            stats={stats}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            activeStatus={activeStatus}
            setActiveStatus={setActiveStatus}
          />

          <TimelineTrends contacts={contacts} />
        </motion.div>

        {/* Workspace Split Layout: Spreadsheet Grid & Outreach Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Main Grid left (8 cols) */}
          <div className="xl:col-span-8 space-y-4">
            {/* Header info showing active filter state */}
            {(activeCategory || activeStatus) && (
              <div className="bg-editorial-sand border border-editorial-linen p-4 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 font-serif text-editorial-ink">
                  <span className="font-bold tracking-tight">Filter Applied:</span>
                  {activeCategory && <span className="italic">"{activeCategory}s" Sector Only</span>}
                  {activeCategory && activeStatus && <span className="text-editorial-mud">and</span>}
                  {activeStatus && <span className="font-semibold underline underline-offset-2">{activeStatus} Pipeline</span>}
                  <span className="text-editorial-mud font-mono text-[11px]">({stats.total === contacts.length ? "all" : stats.total} match)</span>
                </div>
                <button
                  onClick={() => {
                    setActiveCategory(null);
                    setActiveStatus(null);
                  }}
                  className="font-serif italic font-semibold text-editorial-ink hover:underline cursor-pointer"
                  id="reset-grid-filters"
                >
                  Show all
                </button>
              </div>
            )}

            <SpreadsheetGrid
              contacts={contacts}
              onEditContact={handleEditContactClick}
              onDeleteContact={handleDeleteContact}
              onAddContact={handleAddContactClick}
              onResetContacts={handleResetContacts}
              onImportCSV={handleImportCSV}
              onExportCSV={handleExportCSV}
              selectedContactId={selectedContactId}
              setSelectedContactId={setSelectedContactId}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              activeStatus={activeStatus}
              setActiveStatus={setActiveStatus}
            />
          </div>

          {/* Quick Outreach side widget right (4 cols) */}
          <div className="xl:col-span-4 lg:sticky xl:top-[120px]">
            <OutreachPanel
              contact={selectedContact}
              onUpdateStatus={handleUpdateStatusInline}
            />
          </div>

        </div>

      </main>

      {/* Editor Modal for Adding/Editing Rows */}
      <ContactModal
        isOpen={isModalOpen}
        contact={editingContact}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
      />

    </div>
  );
}
