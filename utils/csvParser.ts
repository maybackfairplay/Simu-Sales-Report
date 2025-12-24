
import { SaleRecord } from '../types';

/**
 * A robust CSV parser that handles quotes and different separators.
 */
export const parseCSV = (file: File): Promise<SaleRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return resolve([]);

        // Robust CSV splitting logic (handles quotes)
        const splitCSVLine = (line: string, sep: string) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === sep && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headerLine = lines[0];
        const separator = headerLine.includes('\t') ? '\t' : (headerLine.includes(';') ? ';' : ',');
        const headers = splitCSVLine(headerLine, separator).map(h => h.toLowerCase().trim());

        console.log('Detected CSV Headers:', headers);

        // Map column indices with more flexible matching
        const getIdx = (name: string) => {
          const lowerName = name.toLowerCase().trim();
          // Try exact match first
          let idx = headers.indexOf(lowerName);
          if (idx !== -1) return idx;
          // Try includes match
          idx = headers.findIndex(h => h.includes(lowerName) || lowerName.includes(h));
          return idx;
        };
        
        const idxMap = {
          client: getIdx('client'),
          mobileNo: getIdx('mobile no'),
          branchOffice: getIdx('branch office'),
          dealership: getIdx('dealership'),
          disbursedOnDate: getIdx('disbursedon_date') !== -1 ? getIdx('disbursedon_date') : getIdx('date'),
          registrationNo: getIdx('registration_no'),
          chasisNo: getIdx('chasis_no'),
          make: getIdx('make'),
          model: getIdx('model'),
          type: getIdx('type')
        };

        const records: SaleRecord[] = lines.slice(1).map((line, lineIdx) => {
          const values = splitCSVLine(line, separator);
          const getValue = (i: number) => (i !== -1 && values[i] !== undefined) ? values[i].replace(/^"|"$/g, '').trim() : '';
          
          return {
            client: getValue(idxMap.client),
            mobileNo: getValue(idxMap.mobileNo),
            branchOffice: getValue(idxMap.branchOffice) || 'Unknown Branch',
            dealership: getValue(idxMap.dealership) || 'Unknown Dealership',
            disbursedOnDate: getValue(idxMap.disbursedOnDate),
            registrationNo: getValue(idxMap.registrationNo),
            chasisNo: getValue(idxMap.chasisNo),
            make: getValue(idxMap.make),
            model: getValue(idxMap.model) || 'Unknown Model',
            type: getValue(idxMap.type)
          };
        });

        resolve(records);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsText(file);
  });
};
