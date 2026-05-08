-- Query untuk membuat View v_users di PostgreSQL
-- View ini memudahkan monitoring user dengan ID Cantik (Formatted ID)

CREATE OR REPLACE VIEW v_users AS
SELECT 
    id,
    CASE 
        WHEN role_id = 1 THEN 'OWN-' || LPAD(id::text, 3, '0')
        WHEN role_id = 2 THEN 'STF-' || LPAD(id::text, 3, '0')
        ELSE 'CUS-' || LPAD(id::text, 3, '0')
    END AS formatted_id,
    name,
    email,
    CASE 
        WHEN role_id = 1 THEN 'OWNER'
        WHEN role_id = 2 THEN 'STAFF'
        ELSE 'CUSTOMER'
    END AS role_name,
    phone,
    is_active,
    created_at
FROM public.users;

-- Cara menggunakan:
-- SELECT * FROM v_users;
