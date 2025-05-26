-- 1. Create a sequence for purchase order numbers
CREATE SEQUENCE IF NOT EXISTS purchase_order_number_seq
START WITH 1
INCREMENT BY 1
MINVALUE 1
NO MAXVALUE
CACHE 1;

-- 2. Create a function to generate the purchase order number
CREATE OR REPLACE FUNCTION generate_purchase_order_number()
RETURNS TRIGGER AS $$
DECLARE
    next_id INT;
BEGIN
    IF NEW.purchase_order_number IS NULL OR NEW.purchase_order_number = '' THEN
        SELECT nextval('purchase_order_number_seq') INTO next_id;
        NEW.purchase_order_number := 'PO-' || LPAD(next_id::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger to call the function before insert
CREATE OR REPLACE TRIGGER set_purchase_order_number_trigger
BEFORE INSERT ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION generate_purchase_order_number();
