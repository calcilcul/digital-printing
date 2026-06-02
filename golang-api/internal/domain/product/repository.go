package product

type Repository interface {
	FindAll() ([]Product, error)
	FindAllForAdmin() ([]Product, error)
	Create(product *Product) error
	Update(product *Product) error
	UpdateImageURL(id int, imageURL string) error
	Delete(id int) error
	FindAllCategories() ([]Category, error)
}
