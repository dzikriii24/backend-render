import pool from '../config/database';

export interface Certificate {
    id?: number;
    kode: string;
    nama: string;
    status: string;
    event: string;
    link: string;
}
export const getCertificates = async (): Promise<Certificate[]> => {
    try {
        const result = await pool.query('SELECT * FROM sertifikat ORDER BY created_at DESC');
        return result.rows;
    } catch (err) {
        console.error('Error fetching sertifikat:', err);
        throw new Error('Database error');
    }
};
export const getCertificateByKode = async (kode: string): Promise<Certificate | null> => {
    try {
        const result = await pool.query('SELECT * FROM sertifikat WHERE kode = $1', [kode]);
        return result.rows[0] || null;
    } catch (err) {
        console.error('Error fetching certificate by kode:', err);
        throw new Error('Database error');
    }
};
export const insertCertificate = async (data: Certificate): Promise<void> => {
    const { kode, nama, status, event, link } = data;
    if (!kode || !nama || !status || !event || !link)
        throw new Error('Semua field wajib diisi');
    try {
        await pool.query(
            'INSERT INTO sertifikat (kode, nama, status, event, link) VALUES ($1, $2, $3, $4, $5)',
            [kode, nama, status, event, link]
        );
    } catch (err: any) {
        console.error('Error inserting certificate:', err);
        throw new Error(`Database error: ${err.message}`);
    }
};
export const updateCertificate = async (id: number, data: Certificate): Promise<void> => {
    const { kode, nama, status, event, link } = data;
    try {
        await pool.query(
            'UPDATE sertifikat SET kode=$1, nama=$2, status=$3, event=$4, link=$5 WHERE id=$6',
            [kode, nama, status, event, link, id]
        );
    } catch (err) {
        console.error('Error updating certificate:', err);
        throw new Error('Database error');
    }
};
export const deleteCertificate = async (id: number): Promise<void> => {
    try {
        await pool.query('DELETE FROM sertifikat WHERE id = $1', [id]);
    } catch (err) {
        console.error('Error deleting certificate:', err);
        throw new Error('Database error');
    }
};
