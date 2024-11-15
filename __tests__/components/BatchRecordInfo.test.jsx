/**
 * @fileoverview Test suite for the BatchRecordInfo component.
 * This file contains unit tests to verify the rendering behavior of the BatchRecordInfo component
 * under different scenarios.
 * 
 * @jest-environment jsdom
 * @module BatchRecordInfo.test
 * 
 * @requires @testing-library/react
 * @requires ../../components/BatchRecordInfo
 * 
 * @description
 * The test suite includes:
 * - Verification of all fields rendering with provided props
 * - Testing component behavior with missing props
 * - Validation of heading and label presence
 * 
 * @example
 * const mockProps = {
 *   family: 'Test Family',
 *   partPrefix: 'TP',
 *   partNumber: '12345',
 *   lotNumber: 'LOT123',
 *   documentNumber: 'DOC789',
 *   revision: 'Rev A',
 *   date: '2023-08-01',
 *   dateOfManufacture: '2023-07-31',
 *   description: 'Test Description'
 * };
 */
import { render, screen } from '@testing-library/react';
import BatchRecordInfo from '../../components/BatchRecordInfo';

describe('BatchRecordInfo', () => {
    const mockProps = {
        family: 'Test Family',
        partPrefix: 'TP',
        partNumber: '12345',
        lotNumber: 'LOT123',
        documentNumber: 'DOC789',
        revision: 'Rev A',
        date: '2023-08-01',
        dateOfManufacture: '2023-07-31',
        description: 'Test Description'
    };

    it('renders all fields with correct values', () => {
        render(<BatchRecordInfo {...mockProps} />);

        // Check heading
        expect(screen.getByText('OXY BATCH RECORD')).toBeInTheDocument();

        // Check all field labels and values
        expect(screen.getByText('Family:')).toBeInTheDocument();
        expect(screen.getByText(mockProps.family)).toBeInTheDocument();

        expect(screen.getByText('Part Prefix:')).toBeInTheDocument();
        expect(screen.getByText(mockProps.partPrefix)).toBeInTheDocument();

        expect(screen.getByText('Part Number:')).toBeInTheDocument();
        expect(screen.getByText(mockProps.partNumber)).toBeInTheDocument();

        expect(screen.getByText('Lot Number:')).toBeInTheDocument();
        expect(screen.getByText(mockProps.lotNumber)).toBeInTheDocument();

        expect(screen.getByText('Document Number:')).toBeInTheDocument();
        expect(screen.getByText(mockProps.documentNumber)).toBeInTheDocument();

        expect(screen.getByText('Revision:')).toBeInTheDocument();
        expect(screen.getByText(mockProps.revision)).toBeInTheDocument();

        expect(screen.getByText('Date:')).toBeInTheDocument();
        expect(screen.getByText(mockProps.date)).toBeInTheDocument();

        expect(screen.getByText('Date of Manufacture:')).toBeInTheDocument();
        expect(screen.getByText(mockProps.dateOfManufacture)).toBeInTheDocument();

        expect(screen.getByText('Description:')).toBeInTheDocument();
        expect(screen.getByText(mockProps.description)).toBeInTheDocument();
    });

    it('renders with missing props', () => {
        render(<BatchRecordInfo />);
        
        expect(screen.getByText('Family:')).toBeInTheDocument();
        expect(screen.getByText('Part Prefix:')).toBeInTheDocument();
        expect(screen.getByText('Part Number:')).toBeInTheDocument();
        expect(screen.getByText('Lot Number:')).toBeInTheDocument();
    });
});