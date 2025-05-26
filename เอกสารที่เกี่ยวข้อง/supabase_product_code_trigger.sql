-- 1. Create a sequence for product codes
CREATE SEQUENCE IF NOT EXISTS product_code_seq
START WITH 1
INCREMENT BY 1
MINVALUE 1
NO MAXVALUE
CACHE 1;

-- 2. Create a function to generate the product code
CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS TRIGGER AS $$
DECLARE
    next_id INT;
BEGIN
    IF NEW.product_code IS NULL OR NEW.product_code = '' THEN
        SELECT nextval('product_code_seq') INTO next_id;
        NEW.product_code := 'PRD-' || LPAD(next_id::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger to call the function before insert
CREATE OR REPLACE TRIGGER set_product_code_trigger
BEFORE INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION generate_product_code();
