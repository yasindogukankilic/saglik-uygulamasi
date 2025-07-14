import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Card from './Card';

export default function Table({
  columns,
  data,
  rowActions,          // 👈 callback: (row) => [{label, icon, onClick, danger?}]
  className = ''
}) {
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  const togglePasswordVisibility = (rowIndex) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      next.has(rowIndex) ? next.delete(rowIndex) : next.add(rowIndex);
      return next;
    });
  };

  const renderCell = (col, item, idx) => {
    /* password tipi */
    if (col.type === 'password') {
      const isVisible = visiblePasswords.has(idx);
      return (
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm">
            {isVisible ? item[col.key] : '••••••••'}
          </span>
          <button
            onClick={() => togglePasswordVisibility(idx)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isVisible ? <EyeOff className="w-4 h-4" />
                       : <Eye    className="w-4 h-4" />}
          </button>
        </div>
      );
    }

    /* renkli badge tipi */
    if (col.type === 'badge') {
      const badgeClass = col.getBadgeClass
        ? col.getBadgeClass(item[col.key])
        : 'bg-gray-100 text-gray-800';

      return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
          {item[col.key]}
        </span>
      );
    }

    /* özel render */
    if (col.render) return col.render(item[col.key], item, idx);

    return item[col.key];
  };

  return (
    <Card className={className}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((c) => (
                <th key={c.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {c.title}
                </th>
              ))}
              {rowActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, rowIdx) => (
              <tr key={item.id || rowIdx} className="hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={c.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderCell(c, item, rowIdx)}
                  </td>
                ))}

                {rowActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {rowActions(item).map(({label, icon:Icon, onClick, danger}) => (
                        <button
                          key={label}
                          title={label}
                          onClick={onClick}
                          className={`p-1 rounded transition-colors
                            ${danger ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                     : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50'}`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz veri bulunmuyor</p>
          </div>
        )}
      </div>
    </Card>
  );
}
