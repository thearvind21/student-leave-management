
import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import logo from "/public/favicon.ico"; // Replace with your institution's logo path or use an image component

interface LeavePdfTemplateProps {
  leave: any;
  approver: { name: string; id: string; role: string };
  applicant?: { name: string; role: string; id?: string | null };
  mode?: "dark" | "light";
}

// Utility: Format date as YYYY-MM-DD or locale string
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

const LeavePdfTemplate = React.forwardRef<HTMLDivElement, LeavePdfTemplateProps>(
  ({ leave, approver, applicant, mode = "light" }, ref) => {
    const buildQrUrl = () => {
      try {
        const payload = {
          id: leave.id ?? null,
          name: (applicant?.name || leave.student?.full_name || leave.student_name || leave.faculty_name) ?? "",
          role: applicant?.role || (leave.student_name ? 'Student' : 'Faculty'),
          status: leave.status,
          leave_type: leave.leave_type,
          start_date: leave.start_date,
          end_date: leave.end_date,
          generated_at: new Date().toISOString()
        };
        const json = JSON.stringify(payload);
        const encoded = typeof window !== 'undefined'
          ? btoa(unescape(encodeURIComponent(json)))
          : Buffer.from(json, 'utf-8').toString('base64');
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/verify?q=${encoded}`;
      } catch {
        // Fallback to simple text if encoding fails
        return `Leave#${leave.id ?? ""}|${(leave.student?.full_name ?? leave.student_name ?? leave.faculty_name) ?? ""}|${leave.status}`;
      }
    };

    return (
      <div
        ref={ref}
        id="pdf-template"
        className={`pdf-a4 mx-auto p-8 bg-white dark:bg-[#18181b] rounded shadow border`}
        style={{
          width: "210mm",
          minHeight: "297mm",
          color: mode === "dark" ? "#f3f4f6" : "#18181b",
          fontFamily: "Inter, Arial, sans-serif"
        }}
      >
        {/* Header and Logo */}
        <div className="flex items-center gap-3 border-b pb-2 mb-4">
          <img src={logo} alt="Institution Logo" className="w-12 h-12 rounded" />
          <div>
            <h2 className="font-bold text-2xl">Leave Application </h2>

          </div>
        </div>

        {/* Applicant + Leave Info */}
        <div className="grid grid-cols-2 gap-6 mb-3">
          <div>
            <div>
              <span className="font-semibold">Name:</span>{" "}
              {applicant?.name || leave.student?.full_name || leave.student_name || leave.faculty_name || "—"}
            </div>
            {applicant && (
              <>
                <div>
                  <span className="font-semibold">Role:</span>{" "}{applicant.role}
                </div>
                {applicant.id ? (
                  <div>
                    <span className="font-semibold">ID:</span>{" "}{applicant.id}
                  </div>
                ) : null}
              </>
            )}
          </div>
          <div>
            <div>
              <span className="font-semibold">Leave Type:</span> {leave.leave_type}
            </div>
            <div>
              <span className="font-semibold">From:</span> {formatDate(leave.start_date)}
            </div>
            <div>
              <span className="font-semibold">To:</span> {formatDate(leave.end_date)}
            </div>
          </div>
        </div>
        <div className="mb-3">
          <span className="font-semibold">Reason:</span>{" "}
          <span style={{ whiteSpace: "pre-line" }}>{leave.reason}</span>
        </div>

        {/* Approval Table */}
        <div className="mb-2">
          <table className="w-full border border-gray-300 my-2">
            <tbody>
              <tr>
                <td className="font-semibold border px-3 py-1">Status</td>
                <td className="border px-3 py-1 capitalize">{leave.status}</td>
              </tr>
              <tr>
                <td className="font-semibold border px-3 py-1">Approved By</td>
                <td className="border px-3 py-1">
                  {(approver.name && approver.name.trim().length > 0)
                    ? approver.name
                    : (leave.approved_by_name || '—')}
                </td>
              </tr>
              <tr>
                <td className="font-semibold border px-3 py-1">Generated On</td>
                <td className="border px-3 py-1">
                  {formatDate(new Date().toISOString())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Optional QR and signature */}
        <div className="mt-8 flex items-end justify-between">
          <div>
            <QRCodeCanvas
              value={buildQrUrl()}
              size={96}
              bgColor={mode === "dark" ? "#18181b" : "#fff"}
              fgColor={mode === "dark" ? "#fff" : "#222"}
            />
            <div className="text-xs opacity-80 mt-1">Scan to verify</div>
          </div>
          <div className="text-right">
            <div className="italic text-sm text-gray-400">Signature of Approver</div>
            <div className="border-t border-gray-400 w-40 mt-3"></div>
          </div>
        </div>

      </div>
    );
  }
);
export default LeavePdfTemplate;
