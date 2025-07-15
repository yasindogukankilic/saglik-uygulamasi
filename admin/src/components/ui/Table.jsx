import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Card from './Card';

export default function Table({
  columns,
  data,
  rowActions,          // 👈 callback: (row) => [{label, icon, onClick, danger?}]
  className = '',
  emptyMessage = 'Henüz veri bulunmuyor',
  emptyIcon: EmptyIcon
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
            className="p-1 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title={isVisible ? 'Şifreyi gizle' : 'Şifreyi göster'}
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
      {/* Desktop Table */}
      <div className="hidden md:block">
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
                <tr key={item.id || rowIdx} className="hover:bg-gray-50 transition-colors">
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
                            className={`p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
                              ${danger 
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50 focus:ring-red-500/20'
                                : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 focus:ring-indigo-500/20'}`}
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
              {EmptyIcon && <EmptyIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />}
              <p className="text-gray-500">{emptyMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {data.length === 0 ? (
          <div className="text-center py-12">
            {EmptyIcon && <EmptyIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />}
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {data.map((item, rowIdx) => (
              <div key={item.id || rowIdx} 
                   className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                
                {/* Card Header with Actions */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    {/* Primary field (usually name or title) */}
                    <h4 className="font-medium text-gray-900 truncate">
                      {renderCell(columns[0], item, rowIdx)}
                    </h4>
                  </div>
                  
                  {rowActions && (
                    <div className="flex space-x-1 ml-2">
                      {rowActions(item).map(({label, icon:Icon, onClick, danger}) => (
                        <button
                          key={label}
                          title={label}
                          onClick={onClick}
                          className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2
                            ${danger 
                              ? 'text-red-600 hover:text-red-900 hover:bg-red-50 focus:ring-red-500/20'
                              : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 focus:ring-indigo-500/20'}`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Content - Other Fields */}
                <div className="space-y-2">
                  {columns.slice(1).map((col) => (
                    <div key={col.key} className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {col.title}:
                      </span>
                      <div className="text-sm text-gray-900 text-right">
                        {renderCell(col, item, rowIdx)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}