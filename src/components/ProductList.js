import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { formatPrice } from './utils'
import './productList.css';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import SelectProductModal from './SelectProductModal';
import { useCookies } from './useCookies';

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  handlePageClick,
  handlePrevClick,
  handleNextClick,
  handleFirstClick,
  handleLastClick,
}) => {
  const renderPageNumbers = () => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return pageNumbers.map((pageNumber) => (
      <button
        key={pageNumber}
        onClick={() => {
          console.log(`Clicked on page number ${pageNumber}`);
          handlePageClick(pageNumber);
        }}
        className={currentPage === pageNumber ? 'active' : ''}
      >
        {pageNumber}
      </button>
    ));
  };

  return (
    <div className="pagination">
      <button onClick={() => {
        console.log('Clicked on First');
        handleFirstClick();
      }} disabled={currentPage === 1}>
        First
      </button>
      <button onClick={() => {
        console.log('Clicked on Prev');
        handlePrevClick();
      }} disabled={currentPage === 1}>
        Prev
      </button>
      {renderPageNumbers()}
      <button onClick={() => {
        console.log('Clicked on Next');
        handleNextClick();
      }} disabled={currentPage === totalPages}>
        Next
      </button>
      <button onClick={() => {
        console.log('Clicked on Last');
        handleLastClick();
      }} disabled={currentPage === totalPages}>
        Last
      </button>
    </div>
  );
};


// Main ProductList Component
const ProductList = () => {
  // State Hooks
  const [products, setProducts] = useState({ data: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortField, setSortField] = useState('name');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSelectProductModal, setShowSelectProductModal] = useState(false);
  const [fullTextSearchQuery, setFullTextSearchQuery] = useState('');
  const [deleteCallback, setDeleteCallback] = useState(null);
  const { setCookie, getCookie, removeCookie } = useCookies();
  const [productListState, setProductListState] = useState({
    currentPage: 1,
    itemsPerPage: 5,
    totalPages: 1, // Initialize totalPages to 1
    sortOrder: 'asc', // Initialize sortOrder to 'asc'
    sortField: 'name', // Initialize sortField to 'name'
  });

  // React Router Hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Create a ref for the list item
  const scrollToProductRef = useRef(null);

  // Fetch Products on Component Mount
  useEffect(() => {
    const fetchSortedProducts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/products`, {
          params: {
            sortField,
            sortOrder,
          },
        });
        setProducts({ data: response.data });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSortedProducts();
  }, [sortField, sortOrder]);

  // Scroll to Product on Location Change
  useEffect(() => {
    console.log("Scrolling useEffect triggered");

    const scrollToProductId = location?.state?.scrollToProduct;

    const scrollToProduct = () => {
      const scrollToProductIndex = products.data.findIndex((product) => product._id === scrollToProductId);
      if (scrollToProductIndex !== -1) {
        const newCurrentPage = Math.ceil((scrollToProductIndex + 1) / itemsPerPage);
        setCurrentPage(newCurrentPage);
      }

      // Scroll to the element with the specified ID using JavaScript or a library like scrollIntoView
      const element = document.getElementById(scrollToProductId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (scrollToProductId) {
      scrollToProduct();
    }

    // Focus on the ref if it exists
    if (scrollToProductRef.current) {
      scrollToProductRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location?.state?.scrollToProduct, products.data, itemsPerPage, currentPage]);
  useEffect(() => {
    const restoreState = () => {
      const { productListState } = location.state || {};
      if (productListState) {
        const { currentPage, itemsPerPage, sortOrder, sortField } = productListState;
        setCurrentPage(currentPage);
        setItemsPerPage(itemsPerPage);
        setSortOrder(sortOrder);
        setSortField(sortField);
      }
    };
  
    restoreState();
  }, [location.state]);

  useEffect(() => {
    setCookie('exampleCookie', 'exampleValue', { expires: 7 }); // Set a cookie with a 7-day expiration
    console.log('Cookie set:', getCookie('exampleCookie'));
  }, []);
  
  // Example: Get a cookie value
  useEffect(() => {
    const cookieValue = getCookie('exampleCookie');
    console.log('Cookie Value:', cookieValue);
  }, []);

  // Example: Remove a cookie
  useEffect(() => {
    removeCookie('exampleCookie');
  }, []);

  
  // Edit Product
  const handleEdit = (productId) => {
    const element = document.getElementById(productId);
  
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Focus on the element
      element.focus();
  
      navigate(`/edit-product/${productId}`);
      console.log(`Editing product with ID: ${productId}`);
    } else {
      // If the element is not found, navigate immediately
      navigate(`/edit-product/${productId}`);
      console.log(`Editing product with ID: ${productId}`);
    }
  };
  
// Delete Productconst handleDelete = async (productId) => {
  // Delete Product
const handleDelete = async (productId) => {
  try {
    setShowDeleteConfirmation(true); // Show the delete confirmation modal

    const handleConfirmDelete = async () => {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/products/${productId}`);
        console.log('Deleted the product successfully', productId);

        // Filter out the deleted product from the list of products
        setProducts((prevProducts) => ({
          data: prevProducts.data.filter((product) => product._id !== productId),
        }));
      } catch (error) {
        console.error('Error deleting product:', error.message);
      } finally {
        setShowDeleteConfirmation(false); // Hide the delete confirmation modal
      }
    };

    setDeleteCallback(() => handleConfirmDelete); // Set the callback for deletion
  } catch (error) {
    console.error('Error initiating deletion:', error.message);
  }
};
  // Toggle Checkbox
  const handleCheckboxChange = (productId) => {
    setSelectedProducts((prevSelected) => ({
      ...prevSelected,
      [productId]: !prevSelected[productId],
    }));
  };

  const handleFullTextSearchChange = (e) => {
    setFullTextSearchQuery(e.target.value);
    setCurrentPage(1); // Reset current page when the full-text search query changes
  };
  // Change Items Per Page
  const handleItemsPerPageChange = (e) => {
    // Parse the value from the target element and convert it to an integer
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset current page when the items per page changes
  };

  // Change Search Query
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset current page when the search query changes
  };

  // Apply Filter
  const handleFilterClick = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/products`, {
        params: {
          minPrice: minPrice !== '' ? minPrice : undefined,
          maxPrice: maxPrice !== '' ? maxPrice : undefined,
        },
      });

      setProducts((prevProducts) => ({ ...prevProducts, data: response.data }));
      setDrawerOpen(false);
    } catch (error) {
      console.error('Error applying filter:', error.message);
    }
  };

  // Change Sorting Field
  const handleSortChange = (field) => {
    setSortOrder((prevOrder) => (field === sortField ? (prevOrder === 'asc' ? 'desc' : 'asc') : 'asc'));
    setSortField(field);
  };
  // Delete Selected Products
  // Delete Selected Products
  const handleDeleteSelected = async () => {
    try {
      const selectedProductIds = Object.keys(selectedProducts).filter(
        (productId) => selectedProducts[productId]
      );
  
      if (selectedProductIds.length > 0) {
        setShowDeleteConfirmation(true); // Show the delete confirmation modal
  
        const handleConfirmDeleteSelected = async () => {
          try {
            await Promise.all(
              selectedProductIds.map((productId) =>
                axios.delete(`${process.env.REACT_APP_API_URL}/products/${productId}`)
              )
            );
  
            // Filter out the deleted products from the list of products
            setProducts((prevProducts) => ({
              data: prevProducts.data.filter((product) => !selectedProductIds.includes(product._id)),
            }));
            setSelectedProducts({}); // Clear the selected products
          } catch (error) {
            console.error('Error deleting selected products:', error.message);
          } finally {
            setShowDeleteConfirmation(false); // Hide the delete confirmation modal
          }
        };
  
        setDeleteCallback(() => handleConfirmDeleteSelected); // Set the callback for deletion
      } else {
        // Show the SelectProductModal when no products are selected
        setShowSelectProductModal(true);
      }
    } catch (error) {
      console.error('Error initiating deletion:', error.message);
    }
  };
  
  
  // Pagination Calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredProducts = products.data.filter((product) => {
    const searchTerms = `${product.name} ${product.description} ${product.price} ${product.address}`.toLowerCase();
    const matchesSearchQuery = searchTerms.includes(searchQuery.toLowerCase());
    const matchesFullTextSearchQuery = searchTerms.includes(fullTextSearchQuery.toLowerCase());
    return matchesSearchQuery && matchesFullTextSearchQuery;
  });
  const paginatedProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Page Click Handlers
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    setProductListState({
      currentPage: pageNumber,
      itemsPerPage,
      totalPages,
      sortOrder,
      sortField,
    });
    navigate('.', {
      state: {
        productListState: {
          currentPage: pageNumber,
          itemsPerPage,
          totalPages,
          sortOrder,
          sortField,
        },
      },
    });
  };
  
  const handleNextClick = () => {
    setCurrentPage((prevPage) => {
      const nextPage = Math.min(prevPage + 1, totalPages);
      setProductListState({
        currentPage: nextPage,
        itemsPerPage,
        totalPages,
        sortOrder,
        sortField,
      });
      navigate('.', {
        state: {
          productListState: {
            currentPage: nextPage,
            itemsPerPage,
            totalPages,
            sortOrder,
            sortField,
          },
        },
      });
      return nextPage;
    });
  };
  
  const handlePrevClick = () => {
    setCurrentPage((prevPage) => {
      const prevPageValue = Math.max(prevPage - 1, 1);
      setProductListState({
        currentPage: prevPageValue,
        itemsPerPage,
        totalPages,
        sortOrder,
        sortField,
      });
      navigate('.', {
        state: {
          productListState: {
            currentPage: prevPageValue,
            itemsPerPage,
            totalPages,
            sortOrder,
            sortField,
          },
        },
      });
      return prevPageValue;
    });
  };
  
  const handleFirstClick = () => {
    setCurrentPage(1);
    setProductListState({
      currentPage: 1,
      itemsPerPage,
      totalPages,
      sortOrder,
      sortField,
    });
    navigate('.', {
      state: {
        productListState: {
          currentPage: 1,
          itemsPerPage,
          totalPages,
          sortOrder,
          sortField,
        },
      },
    });
  };
  
  const handleLastClick = () => {
    setCurrentPage(totalPages);
    setProductListState({
      currentPage: totalPages,
      itemsPerPage,
      totalPages,
      sortOrder,
      sortField,
    });
    navigate('.', {
      state: {
        productListState: {
          currentPage: totalPages,
          itemsPerPage,
          totalPages,
          sortOrder,
          sortField,
        },
      },
    });
  };
  
  // JSX Structure
  return (
    <div className="container">
      <h1>Product List</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && filteredProducts.length === 0 && <p>No matching products</p>}
  
      <div className="content-wrapper">
        {/* Search, Sort, and Filter UI */}
        <div className="filter-search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search Products"
          />
          {/* New input for full-text search */}
          <input
            type="text"
            value={fullTextSearchQuery}
            onChange={handleFullTextSearchChange}
            placeholder="Full-Text Search"
          />
          <button className="filter-button" onClick={() => setDrawerOpen(true)}>
            Filter
          </button>
        </div>
        {/* Items Per Page Dropdown */}
        <div className="items-per-page">
          <label>Show:</label>
          <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            {/* Add more options as needed */}
          </select>
          <span>products per page</span>
        </div>
  
        {/* Sorting UI */}
        <div className="sort-container">
          <span>Sort by:</span>
          <button
            className={sortField === 'name' ? `active ${sortOrder}` : ''}
            onClick={() => handleSortChange('name')}
          >
            Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={sortField === 'price' ? `active ${sortOrder}` : ''}
            onClick={() => handleSortChange('price')}
          >
            Price {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
  
        {/* Current Page / Total Pages */}
        <div className="page-info">
          Page {currentPage} / {totalPages}
        </div>
  
        {/* Product List */}
        <ol>
          {paginatedProducts.map((product) => (
            <li key={product._id} id={product._id}> {/* Add id attribute with product._id */}
              <div>
                <input
                  type="checkbox"
                  checked={selectedProducts[product._id] || false}
                  onChange={() => handleCheckboxChange(product._id)}
                />
              </div>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p>Price: {formatPrice(product.price)}</p>
              <p>Phone: {product.phone}</p>
              <p>Address: {product.address}</p> {/* Display the address */}
              <div>
                <button onClick={() => handleEdit(product._id)} className="add-button">
                  Edit
                </button>
                <button onClick={() => handleDelete(product._id)} className="add-button">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageClick={handlePageClick}
          handlePrevClick={handlePrevClick}
          handleNextClick={handleNextClick}
          handleFirstClick={handleFirstClick}
          handleLastClick={handleLastClick}
        />
  
        {/* Add Product Button */}
        <Link to="/add-product">
          <button className="add-button">Add Product</button>
        </Link>
  
        {/* Delete Selected Button */}
        <button onClick={handleDeleteSelected}>Delete Selected</button>
  
        {/* Filter Drawer */}
        <Drawer anchor="right" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
          <div className="drawer-content">
            <TextField
              label="Min Price"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(parseFloat(e.target.value))}
            />
            <TextField
              label="Max Price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
            />
            <Button variant="contained" onClick={handleFilterClick}>
              Apply Filter
            </Button>
          </div>
        </Drawer>
  
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmation} // Use isOpen instead of open
          onCancel={() => setShowDeleteConfirmation(false)} // Use onCancel instead of onClose
          onConfirm={deleteCallback} // Use onConfirm instead of onConfirm
          selectedProductCount={
            Object.keys(selectedProducts).filter((productId) => selectedProducts[productId]).length
          } // Calculate the selected product count here
        />

        {/* Select Product Modal */}
        <SelectProductModal
          isOpen={showSelectProductModal}
          onClose={() => setShowSelectProductModal(false)}
          onConfirm={handleDeleteSelected}
          selectedProductCount={
            Object.keys(selectedProducts).filter((productId) => selectedProducts[productId]).length
          }
        />
      </div>
    </div>
  );
};

export default ProductList;