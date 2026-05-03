export const printLabels = (selectedOrders: any[]) => {
  if (!selectedOrders || selectedOrders.length === 0) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = selectedOrders
    .map((order) => {
      const remark = order.remark || '无';
      let fontSize = '16px';
      if (remark.length > 12) fontSize = '12px';
      if (remark.length > 24) fontSize = '10px';

      return `
      <div class="print-page">
        <div class="barcode">${order.order_id}</div>
        
        <div class="remark-container">
          <span class="remark-text" style="font-size: ${fontSize};">
            ${remark.replace(/\n/g, '<br/>')} 
          </span>
        </div>
      </div>
    `;
    })
    .join('');

  printWindow.document.write(`
    <html>
      <head>
        <style>
          /* 1. 强制覆盖所有边距，这是居中的第一步 */
          @page { 
            size: 40mm 30mm; 
            margin: 0 !important; 
          }
          
          html, body { 
            margin: 0; 
            padding: 0; 
            width: 40mm; 
            height: 30mm; 
            background: #fff;
          }
          
          /* 2. 锁定打印页面的宽度为绝对的 40mm */
          .print-page { 
            width: 40mm; 
            height: 30mm; 
            box-sizing: border-box;
            display: flex; 
            flex-direction: column; 
            align-items: center;    /* 水平居中 */
            justify-content: center; /* 垂直居中 */
            page-break-after: always; 
            overflow: hidden;
            padding: 2mm 0;         /* 留上下边距，左右不留，交给 flex 居中 */
            padding-left: 4mm;  /* 👈 根据实际打印结果微调这个数值 */
            padding-right: 0;
          }
          
          .print-page:last-child { page-break-after: auto; }

          /* 3. 确保单号框是一个独立的块，便于水平对齐 */
          .barcode { 
            display: inline-block;
            font-size: 16px; 
            font-weight: bold; 
            border: 1.5px solid #000; 
            padding: 2px 8px;
            margin-bottom: 5px;
            white-space: nowrap;
          }

          /* 4. 备注容器必须占满宽度，内部文字居中 */
          .remark-container {
            width: 100%;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .remark-text {
            display: block;
            width: 90%;             /* 给边缘留一点点呼吸空间 */
            font-weight: 700;
            line-height: 1.2;
            word-break: break-all;
            color: #000;
            margin: 0 auto;         /* 强制水平居中 */
          }
        </style>
      </head>
      <body>
        ${content}
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => { window.close(); }, 200);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
