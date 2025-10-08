// PayrollUpload.jsx
// Day 1: Upload Excel/CSV -> preview columns & rows -> select rows -> Send
// Uses: React, axios, xlsx (SheetJS), Tailwind CSS


import React, { useState, useRef, useContext } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { ThemeContext } from "../../../context/ThemeContext";
import { getThemeStyles } from "../../../utils/themeStyles";


export default function PayrollUpload() {
  const { theme } = useContext(ThemeContext);
  const Styles = getThemeStyles(theme);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      /* read file */
      const workbook = XLSX.read(data, { type: "binary" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // convert to json (array of objects, using first row as header)
      let json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // Fix Excel date serials in Pay Date column
      const isExcelDateSerial = (val) => typeof val === 'number' && val > 20000 && val < 90000;
      const excelDateToString = (serial) => {
        // Excel's epoch starts at 1899-12-30
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        // Format as DD-MM-YYYY
        const dd = String(date_info.getUTCDate()).padStart(2, '0');
        const mm = String(date_info.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = date_info.getUTCFullYear();
        return `${dd}-${mm}-${yyyy}`;
      };
      json = json.map((row) => {
        const newRow = { ...row };
        if ('Pay Date' in newRow && isExcelDateSerial(newRow['Pay Date'])) {
          newRow['Pay Date'] = excelDateToString(newRow['Pay Date']);
        }
        return newRow;
      });

      if (json.length === 0) {
        setColumns([]);
        setRows([]);
        return;
      }

      const cols = Object.keys(json[0]);
      setColumns(cols);
      setRows(json.map((r, idx) => ({ __rowId: idx, ...r })));
      setSelected(new Set());
    };

    // for CSV and XLSX this works
    reader.readAsBinaryString(file);
  };

  const toggleRow = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  };

  const toggleSelectAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.__rowId)));
    }
  };

  const handleSend = async () => {
    if (selected.size === 0) return;
    // Prepare payload: selected rows only
    const selectedRows = rows.filter((r) => selected.has(r.__rowId));

    // Example payload format expected by backend
    const payload = {
      rows: selectedRows,
    };

    try {
      setLoading(true);
      // POST to backend endpoint. Replace URL if your backend path differs.
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/payroll/send-mails`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // If backend not ready, you will likely get network error — it's fine for Day 1.
      alert("Request completed. Check server logs / response: " + JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      // For Day 1 we show selected rows in the console for QA if server not available
      console.log("API URL: ", `${process.env.REACT_APP_API_URL}/api/payroll/send-mails`);
      console.log("Selected rows (preview):", selectedRows);
      alert("Could not contact server. Selected rows printed to console for preview.");
    } finally {
      setLoading(false);
    }
  };

  // Generate and download an Excel template with the required header columns
  const handleDownloadTemplate = () => {
    const headers = [
      'Emp No', 'Name', 'Department', 'Designation', 'Gender', 'PF UAN No', 'PAN Number', 'ESIC No', 'Bank Acc No', 'Paid Days',
      'BASIC', 'DA', 'HRA', 'IR/Allowance', 'Arrears', 'Gross Earning', 'Professional Tax', 'Gross Deduction', 'Net Amount', 'Net Pay in Words', 'Pay Month', 'Pay Date', 'Email'
    ];

    // create worksheet with single empty row so headers appear
    const wsData = [headers];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PayrollTemplate');

    // write workbook and trigger download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_template.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`max-w-16xl mx-auto py-8 px-4 md:px-8`}>
      <div className={`rounded-2xl shadow-xl border border-gray-700 bg-gradient-to-br from-blue-950/80 to-gray-900/80 ${Styles.card} p-8`}>
        <h2 className="text-3xl font-bold mb-2 text-blue-200 tracking-tight">Payroll Upload</h2>
        <p className="mb-6 text-gray-300">Upload your payroll Excel/CSV, preview, select, and send to employees.</p>

        <div className="mb-6">
          <button
            onClick={handleDownloadTemplate}
            className={`px-4 py-2 rounded-lg font-semibold border border-blue-700 bg-blue-800 hover:bg-blue-700 text-blue-100 transition`}
          >
            download excel format
          </button>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-semibold text-blue-100">Upload Excel (.xlsx/.xls) or CSV</label>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            className="mb-2 block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800"
          />
        </div>

        {columns.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-lg bg-gray-800/60 rounded-xl border border-dashed border-gray-600">
            <span>No file loaded. Upload a payroll sheet to preview columns and rows.</span>
          </div>
        ) : (
          <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className={`px-4 py-2 rounded-lg font-semibold border border-blue-700 bg-blue-800 hover:bg-blue-700 text-blue-100 transition`}
                >
                  {selected.size === rows.length ? "Unselect All" : "Select All"}
                </button>
                <span className="text-sm text-gray-300">{rows.length} rows</span>
              </div>
              <div>
                <button
                  onClick={handleSend}
                  disabled={selected.size === 0 || loading}
                  className={`px-5 py-2 rounded-lg font-semibold shadow ${selected.size === 0 || loading ? 'opacity-50 cursor-not-allowed bg-gray-700 text-gray-300' : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'}`}
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
            <div className="overflow-auto border rounded-xl shadow-inner bg-gray-950/80">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-blue-950 text-blue-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-2 font-semibold">#</th>
                    <th className="p-2 font-semibold">Select</th>
                    {columns.map((c) => (
                      <th key={c} className="p-2 font-semibold">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.__rowId} className="border-t border-gray-800 hover:bg-blue-950/40 transition">
                      <td className="p-2 align-top text-gray-400">{idx + 1}</td>
                      <td className="p-2 align-top">
                        <input
                          type="checkbox"
                          checked={selected.has(row.__rowId)}
                          onChange={() => toggleRow(row.__rowId)}
                          className="accent-blue-600 w-4 h-4"
                        />
                      </td>
                      {columns.map((c) => (
                        <td key={c} className="p-2 align-top whitespace-pre-wrap text-gray-100">{String(row[c])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 text-sm text-blue-100/80 bg-blue-950/60 rounded-xl p-4 border border-blue-900">
          <p className="font-semibold mb-1">Notes:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>The sheet should contain a column with employee emails (e.g., <code className="bg-gray-800 px-1 rounded">Email</code>).</li>
            <li>Make sure the first row in the sheet is the header row (column names).</li>
            <li>This UI previews rows and allows selection; backend integration for PDF + mail is Day 2.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/*
Integration / Setup Instructions (add to your README):

1) Install dependencies in frontend:
   npm install xlsx axios

2) Place PayrollUpload.jsx inside frontend/src/pages/HR/ or your component folder.

3) Import & route it in your app (example):
   import PayrollUpload from './pages/HR/PayrollUpload';
   <Route path="/hr/payroll" element={<PayrollUpload/>} />

4) Tailwind: styles assume Tailwind is available. Adjust classes if you use plain CSS.

5) Backend: Day 2 will implement POST /api/payroll/send-mails which accepts { rows: Array }.

*/
