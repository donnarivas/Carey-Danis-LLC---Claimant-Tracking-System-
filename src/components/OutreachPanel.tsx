import React, { useState } from "react";
import { Contact } from "../types";
import { Mail, Phone, Copy, Check, MessageSquareCode, ExternalLink, CalendarDays, Download, Activity } from "lucide-react";

interface OutreachPanelProps {
  contact: Contact | null;
  onUpdateStatus: (id: string, stat: any) => void;
}

export const OutreachPanel: React.FC<OutreachPanelProps> = ({
  contact,
  onUpdateStatus,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!contact) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 font-sans h-full flex flex-col justify-center items-center space-y-2">
        <MessageSquareCode className="h-10 w-10 text-slate-300 stroke-1" />
        <p className="font-semibold text-sm text-slate-600">No Contact Selected</p>
        <p className="text-xs max-w-xs">
          Select any contact row in the spreadsheet to generate rapid outreach email templates and copy connection assets.
        </p>
      </div>
    );
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(contact.phoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Pre-generate professional outreach template based on Category & Contact details
  const getOutreachEmailTemplate = () => {
    const greeting = `Dear ${contact.contactName.split(" ")[0] || contact.contactName},`;
    const org = contact.organization;
    const title = contact.title;

    switch (contact.category) {
      case "School Counselor":
        return `${greeting}

I hope this message finds you well. I am reaching out to you in your capacity as the ${title} at ${org}.

I am working with the law firm Carey & Danis LLC on a nationwide legal case analyzing whether major social media companies designed their platforms (like Meta, TikTok, Snapchat, and YouTube) to be addictive to kids and teens, resulting in severe anxiety, clinical depression, or eating disorders. 

As an educator and student support professional, you see these social media impacts firsthand. We are sharing general, factual information about this ongoing youth litigation with local counseling teams and student care leaders. I would love to arrange a brief, 10-minute coffee meeting or Zoom brief to share informational brochures and resources that you can make available for parents and families completely free.

Are you available for a brief call next Tuesday or Thursday morning?

Kind regards,

[My Name]
Intake Coordinator
Carey & Danis LLC`;

      case "Therapist":
        return `${greeting}

I hope you are having a productive week. I am reaching out to you as a care professional at ${org}.

I am working with Carey & Danis LLC on a nationwide litigation case representing teenagers and young adults who developed severe depression, anxiety, eating disorders, or self-harm connected to heavy, addictive use of social media platforms (Instagram, TikTok, Snapchat, and YouTube).

Since clinical diagnoses are key to evaluating these cases, we want to share factual, passive information about the litigation and case criteria with youth and adolescent mental health practitioners. We would love to share free informational brochures for your waiting lobby to help families learn more about these free screenings and contingent-basis legal reviews.

Could we schedule a short, 5-minute conversation sometime next week to share these helpful brochures?

Warmly,

[My Name]
Intake Coordinator
Carey & Danis LLC`;

      case "Parent Organization":
        return `${greeting}

I hope you are doing well. I am writing to you in your role as a vital family voice at ${org}.

I'm working as an intake coordinator with Carey & Danis LLC on a nationwide litigation targeting major social media networks (Instagram, TikTok, Snapchat, and YouTube) for intentionally designing addictive platforms that have led to severe adolescent mental health struggles, including anxiety, depression, or sleep/eating disorders.

Many parents are deeply concerned about these digital impacts but are unaware that there is structured legal recourse and free case screening available. We would love to provide informational flyers next month for your parent community newsletter or family forum so parents can learn about the litigation.

Could we coordinate a brief, 5-minute call to discuss if this fits into your upcoming agenda?

Best regards,

[My Name]
Intake Coordinator
Carey & Danis LLC`;

      case "Church":
        return `${greeting}

I hope you are having a blessed week. I am reaching out to connect with ${org} regarding your family and youth pastoral care ministries.

I am working with Carey & Danis LLC on a nationwide case regarding youth social media addiction. The litigation claims that major social media platforms designed their platforms to be highly addictive to minors, leading to severe mental health struggles like depression, anxiety, and self-harm.

Given the heavy impact of social media on adolescent wellbeing, we are sharing factual, passive information about this lawsuit with local youth groups and churches. We provide free informational brochures explaining the litigation which can be offered without cost or obligation to families in your community care programs.

Would you be open to a quick 10-minute meeting to discuss how we can make these resources available?

Blessings,

[My Name]
Intake Coordinator
Carey & Danis LLC`;

      case "Youth Nonprofit":
        return `${greeting}

I hope you are well. I'm reaching out to you as the ${title} at ${org}, which does such outstanding work for local young leaders.

I am working as an outreach intake coordinator with Carey & Danis LLC on a nationwide litigation case regarding youth social media addiction. We are investigating how addictive algorithms on platforms like Meta, TikTok, Snapchat, and YouTube have caused severe mental health harms in teenagers.

We want to collaborate with local youth nonprofits to share factual assets, digital safety informational brochures, and free case-screening guidelines for affected parents in your network. There is no cost whatsoever to families to have their cases reviewed.

Do you have 15 minutes next week for a quick brainstorming call on how we can share this helpful information?

Best,

[My Name]
Intake Coordinator
Carey & Danis LLC`;

      case "Community Center":
      default:
        return `${greeting}

I hope you are well today. I am reaching out to you because of ${org}'s incredible role as a pillar of neighborhood engagement.

I am working with the law firm Carey & Danis LLC on a nationwide litigation looking at whether major social media companies designed their platforms to be highly addictive to teenagers, leading to severe adolescent mental health struggles like depression and anxiety.

As the ${title} of the center, youth welfare is close to your mission. We are looking to host an informational table, share flyers at an upcoming civic resource fair, or place educational brochures about this litigation on your community center board.

Could you share details on your upcoming activity calendar, space rental specifications, or any community resource days where we could share this helpful information with local families?

Sincerely,

[My Name]
Intake Coordinator
Carey & Danis LLC`;
    }
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(getOutreachEmailTemplate());
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Elegant Editorial Header & Letterhead style
      doc.setFillColor(249, 246, 240); // Soft Eggshell background
      doc.rect(0, 0, 210, 42, "F");

      // Solid divider line
      doc.setDrawColor(200, 190, 175);
      doc.setLineWidth(0.8);
      doc.line(0, 42, 210, 42);

      // Letterhead branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(33, 37, 41); // Deep ink
      doc.text("CAREY & DANIS LLC", 18, 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(140, 115, 85); // Mud accent color
      doc.text("ATTORNEYS AT LAW  |  OUTREACH & INTAKE PORTAL", 18, 22);
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text(`Target: ${contact.organization}  |  Contact Person: ${contact.contactName} (${contact.category})`, 18, 30);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 18, 35);

      // Body of the letter template
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(40, 40, 40);

      const templateText = getOutreachEmailTemplate();
      
      // Wrap text within bounds (width 174mm)
      const splitText = doc.splitTextToSize(templateText, 174);
      
      let y = 54;
      const pageHeight = 297;
      const marginBottom = 25;

      splitText.forEach((line: string) => {
        if (y > pageHeight - marginBottom) {
          doc.addPage();
          // Header on next pages
          doc.setDrawColor(230, 225, 215);
          doc.setLineWidth(0.3);
          doc.line(18, 15, 192, 15);
          
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7.5);
          doc.setTextColor(120, 120, 120);
          doc.text("Carey & Danis LLC - Outreach Draft (Continued)", 18, 12);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          doc.setTextColor(40, 40, 40);
          y = 25;
        }
        doc.text(line, 18, y);
        y += 6; // line height spacing
      });

      // Decorative page footer
      doc.setDrawColor(220, 215, 205);
      doc.setLineWidth(0.3);
      doc.line(18, 276, 192, 276);
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      doc.text("Confidential informational document compiled for internal outreach coordinators. Carey & Danis LLC.", 18, 281);

      const safeName = contact.contactName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      doc.save(`Outreach_Letter_${safeName}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white border border-editorial-linen p-6 space-y-5 h-full" id="outreach-helper-panel">
      {/* Active Partner Info */}
      <div className="flex flex-col gap-3 border-b border-editorial-linen/30 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="editorial-badge">{contact.category}</span>
            <span className="text-[9px] uppercase tracking-wider font-mono text-editorial-mud">comms helper</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-editorial-ink leading-tight">{contact.contactName}</h3>
          <p className="text-xs font-serif italic text-editorial-mud mt-0.5">
            {contact.title} at <span className="font-sans font-semibold text-editorial-ink not-italic">{contact.organization}</span>
          </p>
        </div>

        {/* Change Status Dropdown right within reach */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-editorial-mud">Contact Status:</span>
          <select
            value={contact.status}
            onChange={(e) => onUpdateStatus(contact.id, e.target.value)}
            className="text-xs font-mono uppercase tracking-wider py-1.5 px-3 border border-editorial-linen bg-white text-editorial-ink cursor-pointer outline-hidden focus:border-editorial-ink"
            id="outreach-status-selector"
          >
            <option value="New">New</option>
            <option value="Attempted Contact">Attempted</option>
            <option value="In Discussion">In Discussion</option>
            <option value="Connected">Connected</option>
            <option value="Follow-up Needed">Follow-up</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </div>
      </div>

      {/* Copy Actions Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Email button */}
        <button
          onClick={handleCopyEmail}
          className="flex items-center justify-between p-3 border border-editorial-linen bg-editorial-egg/30 hover:bg-editorial-sand/40 transition-colors group cursor-pointer"
          id="copy-email-asset"
        >
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-editorial-ink shrink-0" />
            <div className="text-left font-serif">
              <p className="font-semibold text-editorial-ink">Copy Email</p>
              <p className="text-[10px] text-editorial-mud font-mono truncate max-w-[140px] mt-0.5">{contact.email}</p>
            </div>
          </div>
          <div className="p-1 border border-editorial-linen bg-white">
            {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-800" /> : <Copy className="h-3.5 w-3.5 text-editorial-mud group-hover:text-editorial-ink" />}
          </div>
        </button>

        {/* Phone button */}
        <button
          onClick={handleCopyPhone}
          className="flex items-center justify-between p-3 border border-editorial-linen bg-editorial-egg/30 hover:bg-editorial-sand/40 transition-colors group cursor-pointer"
          disabled={!contact.phoneNumber}
          id="copy-phone-asset"
        >
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-editorial-ink shrink-0" />
            <div className="text-left font-serif">
              <p className="font-semibold text-editorial-ink">Copy Phone</p>
              <p className="text-[10px] text-editorial-mud font-mono truncate max-w-[140px] mt-0.5">{contact.phoneNumber || "No phone added"}</p>
            </div>
          </div>
          <div className="p-1 border border-editorial-linen bg-white">
            {copiedPhone ? <Check className="h-3.5 w-3.5 text-emerald-800" /> : <Copy className="h-3.5 w-3.5 text-editorial-mud group-hover:text-editorial-ink" />}
          </div>
        </button>
      </div>

      {/* Interactive Individual Workflow Timeline Infographic */}
      <div className="border border-editorial-linen p-4 bg-editorial-board/20 space-y-3.5" id="claimant-workflow-tracker">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-editorial-ink flex items-center gap-1">
          <Activity className="h-3.5 w-3.5 text-editorial-ink" />
          Interactive Claimant Workflow
        </h4>
        
        {/* Horizontal Visual Timeline Line & Nodes */}
        <div className="relative pt-2 pb-6 text-center select-none">
          <div className="absolute top-[23px] left-6 right-6 h-0.5 bg-editorial-linen" />
          <div 
            className="absolute top-[23px] left-6 h-0.5 bg-editorial-ink transition-all duration-300"
            style={{
              width: 
                contact.status === "New" ? "0%" :
                contact.status === "Attempted Contact" ? "33%" :
                contact.status === "In Discussion" ? "66%" : "100%"
            }}
          />
          
          <div className="flex justify-between relative">
            {[
              { label: "New", statusVal: "New" },
              { label: "Attempted", statusVal: "Attempted Contact" },
              { label: "Discussion", statusVal: "In Discussion" },
              { label: "Ready", statusVal: "Connected" }
            ].map((node, idx) => {
              const nodeActive = contact.status === node.statusVal || 
                (node.statusVal === "Connected" && ["Connected", "Follow-up Needed", "Not Interested"].includes(contact.status));
              const nodePassed = 
                (contact.status !== "New" && idx === 0) ||
                (["In Discussion", "Connected", "Follow-up Needed", "Not Interested"].includes(contact.status) && idx === 1) ||
                (["Connected", "Follow-up Needed", "Not Interested"].includes(contact.status) && idx === 2);

              return (
                <button
                  key={idx}
                  onClick={() => onUpdateStatus(contact.id, node.statusVal)}
                  className="flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer group"
                  title={`Update status to ${node.label}`}
                  style={{ width: "60px" }}
                >
                  <div className={`h-6.5 w-6.5 rounded-full border-2 flex items-center justify-center transition-all duration-150 z-10 ${
                    nodeActive 
                      ? "bg-editorial-ink border-editorial-ink text-editorial-egg shadow-xs scale-105" 
                      : nodePassed
                        ? "bg-editorial-egg border-editorial-ink text-editorial-ink"
                        : "bg-white border-editorial-linen text-editorial-mud group-hover:border-editorial-mud"
                  }`}>
                    {nodePassed ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-[9px] font-mono leading-none">{idx + 1}</span>
                    )}
                  </div>
                  <span className={`text-[9px] font-mono uppercase tracking-tight absolute top-[28px] transition-colors ${
                    nodeActive ? "text-editorial-ink font-bold" : "text-editorial-mud"
                  }`}>
                    {node.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Interaction subtitle hint */}
        <p className="text-[9.5px] font-serif italic text-editorial-mud/90 text-center leading-normal">
          Click timeline stages above to transition participant status over time.
        </p>
      </div>

      {/* Helper Outreach Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink font-semibold flex items-center gap-1.5">
            <MessageSquareCode className="h-4 w-4 text-editorial-ink" />
            Draft Dispatch Template
          </label>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPDF}
              className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink hover:underline flex items-center gap-1 cursor-pointer font-bold"
              id="download-template-pdf-btn"
              title="Download outreach email template as PDF"
            >
              <Download className="h-3 w-3 inline" />
              DOWNLOAD PDF
            </button>
            <span className="text-editorial-linen text-[10px]">|</span>
            <button
              onClick={handleCopyTemplate}
              className="text-[10px] font-mono uppercase tracking-wider text-editorial-ink hover:underline flex items-center gap-1 cursor-pointer font-bold"
              id="copy-template-btn"
            >
              {copiedTemplate ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-800 animate-bounce inline" />
                  DRAFT COPIED
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 inline" />
                  COPY DRAFT
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Pre-generated Draft Container */}
        <div className="relative bg-editorial-egg/40 border border-editorial-linen p-4 h-48 overflow-y-auto">
          <pre className="text-[11px] font-mono whitespace-pre-wrap text-editorial-ink/90 leading-relaxed">
            {getOutreachEmailTemplate()}
          </pre>
        </div>

        {/* Mini Guide details info */}
        <div className="flex items-start gap-1.5 text-[10px] text-editorial-mud bg-editorial-board/40 p-3 border border-editorial-linen/50">
          <span className="font-mono uppercase text-editorial-ink font-bold shrink-0">Note:</span>
          <span className="font-serif italic">
            {contact.followUp ? (
              <><strong>Active Follow-up Goal:</strong> {contact.followUp}</>
            ) : (
              <>Substitute placeholder brackets <code>[My Name]</code>, <code>[My Title]</code>, and <code>[My Phone]</code> prior to sending.</>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
