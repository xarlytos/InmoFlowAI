import jsPDF from 'jspdf';
import * as ExcelJS from 'exceljs';
import type { Property } from '@/features/core/types';

export const exportToPDF = async (properties: Property[], filename = 'properties.pdf') => {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  let yPosition = 20;
  const lineHeight = 10;
  const marginLeft = 20;
  const marginRight = 20;
  
  // Title
  pdf.setFontSize(20);
  pdf.text('Properties Report', marginLeft, yPosition);
  yPosition += 20;
  
  // Summary
  pdf.setFontSize(12);
  pdf.text(`Total Properties: ${properties.length}`, marginLeft, yPosition);
  yPosition += 10;
  
  const totalValue = properties.reduce((sum, prop) => sum + prop.price, 0);
  const avgPrice = totalValue / properties.length;
  
  pdf.text(`Average Price: €${Math.round(avgPrice).toLocaleString()}`, marginLeft, yPosition);
  yPosition += 10;
  pdf.text(`Total Portfolio Value: €${totalValue.toLocaleString()}`, marginLeft, yPosition);
  yPosition += 20;
  
  // Properties list
  pdf.setFontSize(14);
  pdf.text('Properties List', marginLeft, yPosition);
  yPosition += 15;
  
  pdf.setFontSize(10);
  
  properties.forEach((property, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Property header
    pdf.setFont(undefined, 'bold');
    pdf.text(`${index + 1}. ${property.title}`, marginLeft, yPosition);
    yPosition += lineHeight;
    
    pdf.setFont(undefined, 'normal');
    
    // Price and reference
    pdf.text(`Price: €${property.price.toLocaleString()} | Ref: ${property.ref}`, marginLeft + 5, yPosition);
    yPosition += lineHeight;
    
    // Location
    pdf.text(`Location: ${property.address.street}, ${property.address.city}`, marginLeft + 5, yPosition);
    yPosition += lineHeight;
    
    // Features
    const features = `${property.features.rooms} rooms • ${property.features.baths} baths • ${property.features.area}m²`;
    pdf.text(`Features: ${features}`, marginLeft + 5, yPosition);
    yPosition += lineHeight;
    
    // Amenities
    const amenities = [];
    if (property.features.hasElevator) amenities.push('Elevator');
    if (property.features.parking) amenities.push('Parking');
    if (property.features.hasBalcony) amenities.push('Balcony');
    if (amenities.length > 0) {
      pdf.text(`Amenities: ${amenities.join(', ')}`, marginLeft + 5, yPosition);
      yPosition += lineHeight;
    }
    
    // Status
    pdf.text(`Status: ${property.status}`, marginLeft + 5, yPosition);
    yPosition += lineHeight;
    
    // Price per sqm
    const pricePerSqm = Math.round(property.price / property.features.area);
    pdf.text(`Price/m²: €${pricePerSqm}`, marginLeft + 5, yPosition);
    yPosition += lineHeight * 1.5;
  });
  
  // Footer
  const currentDate = new Date().toLocaleDateString();
  pdf.setFontSize(8);
  const footerY = pageHeight - 10;
  pdf.text(`Generated on ${currentDate}`, marginLeft, footerY);
  pdf.text(`Page ${pdf.getCurrentPageInfo().pageNumber}`, pageWidth - 40, footerY);
  
  pdf.save(filename);
};

export const exportToExcel = async (properties: Property[], filename = 'properties.xlsx') => {
  const workbook = new ExcelJS.Workbook();
  
  // Properties Sheet
  const worksheet = workbook.addWorksheet('Properties');
  
  // Define columns
  worksheet.columns = [
    { header: 'Reference', key: 'ref', width: 12 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Price (€)', key: 'price', width: 15 },
    { header: 'Price/m² (€)', key: 'pricePerSqm', width: 15 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'Address', key: 'address', width: 40 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Rooms', key: 'rooms', width: 8 },
    { header: 'Bathrooms', key: 'baths', width: 10 },
    { header: 'Area (m²)', key: 'area', width: 12 },
    { header: 'Floor', key: 'floor', width: 8 },
    { header: 'Elevator', key: 'elevator', width: 10 },
    { header: 'Parking', key: 'parking', width: 10 },
    { header: 'Balcony', key: 'balcony', width: 10 },
    { header: 'Year Built', key: 'year', width: 12 },
    { header: 'Energy Label', key: 'energyLabel', width: 15 },
    { header: 'Created Date', key: 'createdAt', width: 15 },
    { header: 'Days on Market', key: 'daysOnMarket', width: 15 }
  ];
  
  // Style header row
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  
  // Add data rows
  properties.forEach((property) => {
    const daysOnMarket = Math.ceil((Date.now() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const pricePerSqm = Math.round(property.price / property.features.area);
    
    const row = worksheet.addRow({
      ref: property.ref,
      title: property.title,
      price: property.price,
      pricePerSqm: pricePerSqm,
      city: property.address.city,
      address: property.address.street,
      type: property.type,
      status: property.status,
      rooms: property.features.rooms,
      baths: property.features.baths,
      area: property.features.area,
      floor: property.features.floor || 'N/A',
      elevator: property.features.hasElevator ? 'Yes' : 'No',
      parking: property.features.parking ? 'Yes' : 'No',
      balcony: property.features.hasBalcony ? 'Yes' : 'No',
      year: property.features.year || 'N/A',
      energyLabel: property.features.energyLabel || 'N/A',
      createdAt: new Date(property.createdAt).toLocaleDateString(),
      daysOnMarket: daysOnMarket
    });
    
    // Style data rows
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Color-code status
    const statusCell = row.getCell('status');
    switch (property.status) {
      case 'active':
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4F6D4' } };
        break;
      case 'sold':
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB8E6B8' } };
        break;
      case 'reserved':
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
        break;
      case 'rented':
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADD8E6' } };
        break;
    }
  });
  
  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 20 }
  ];
  
  // Summary data
  const totalProperties = properties.length;
  const totalValue = properties.reduce((sum, prop) => sum + prop.price, 0);
  const avgPrice = Math.round(totalValue / totalProperties);
  const avgArea = Math.round(properties.reduce((sum, prop) => sum + prop.features.area, 0) / totalProperties);
  const statusCounts = properties.reduce((acc, prop) => {
    acc[prop.status] = (acc[prop.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const summaryData = [
    { metric: 'Total Properties', value: totalProperties },
    { metric: 'Total Portfolio Value', value: `€${totalValue.toLocaleString()}` },
    { metric: 'Average Price', value: `€${avgPrice.toLocaleString()}` },
    { metric: 'Average Area', value: `${avgArea}m²` },
    { metric: 'Active Properties', value: statusCounts.active || 0 },
    { metric: 'Sold Properties', value: statusCounts.sold || 0 },
    { metric: 'Reserved Properties', value: statusCounts.reserved || 0 },
    { metric: 'Rented Properties', value: statusCounts.rented || 0 },
  ];
  
  summaryData.forEach((item) => {
    summarySheet.addRow(item);
  });
  
  // Style summary sheet
  summarySheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }
    };
  });
  
  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};