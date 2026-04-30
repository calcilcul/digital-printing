package product

type Repository interface {
	FindAll() ([]Product, error)
	Create(product *Product) error
	Update(product *Product) error
	Delete(id int) error
}
