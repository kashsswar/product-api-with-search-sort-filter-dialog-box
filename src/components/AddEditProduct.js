import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import './editProduct.css';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { control, handleSubmit, setValue, formState: { errors } } = useForm();

  // Get the scrollToProduct value from the current location state
  const scrollToProduct = location.state?.scrollToProduct || null;

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (id) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}`);
          const fetchedProductData = response.data.product;

          setValue('name', fetchedProductData.name || '');
          setValue('description', fetchedProductData.description || '');
          setValue('price', fetchedProductData.price ? `$${fetchedProductData.price}` : '');
          setValue('address', fetchedProductData.address || '');
          setValue('phone', fetchedProductData.phone || '');
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      }
    };

    fetchProductDetails();
  }, [id, setValue]);

  const handleCancel = () => {
    // Navigate back to the product list, preserving the current scroll position
    navigate('/product-list', { state: { scrollToProduct } });
  };

  const onSubmit = async (data) => {
    const priceWithoutDollarSign = parseFloat(data.price.toString().replace('$', ''));
    const formData = {
      name: data.name,
      description: data.description,
      price: priceWithoutDollarSign,
      address: data.address,
      phone: data.phone,
    };
  
    try {
      let response;
  
      if (id) {
        // Update product
        response = await axios.put(`${process.env.REACT_APP_API_URL}/products/${id}`, formData);
        console.log(`Product updated successfully: ${id}`);
      } else {
        // Add new product
        response = await axios.post(`${process.env.REACT_APP_API_URL}/products`, formData);
        console.log(`Product added successfully: ${response.data.product._id}`);
      }
  
      // Navigate back to the product list, preserving the current scroll position
      navigate('/product-list', { state: { scrollToProduct: id || response.data.product._id } });
  
      // Note: The following line is added to force a page reload and fetch the updated data
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };
  const handlePhoneNumberChange = (inputPhoneNumber, onChange) => {
    const formattedPhoneNumber = formatPhoneNumber(inputPhoneNumber);
    onChange(formattedPhoneNumber);
  };

  const formatPhoneNumber = (phoneNumber) => {
    // Remove non-numeric characters
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');

    // Apply formatting: ___-___-____
    const match = cleanedPhoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }

    return cleanedPhoneNumber; // If no match, return as is
  };

  return (
    <div className="container">
      <h1>{id ? 'Edit Product' : 'Add Product'}</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="name">Product Name:</label>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Product Name is required' }}
          render={({ field }) => (
            <>
              <input
                type="text"
                id="name"
                {...field}
                placeholder={errors.name ? '' : 'Product Name'}
              />
              {errors.name && <div className="error">&#9888; {errors.name.message}</div>}
            </>
          )}
        />

        <label htmlFor="description">Product Description:</label>
        <Controller
          name="description"
          control={control}
          rules={{ required: 'Product Description is required' }}
          render={({ field }) => (
            <>
              <textarea
                id="description"
                {...field}
                placeholder={errors.description ? '' : 'Product Description'}
              />
              {errors.description && <div className="error">&#9888; {errors.description.message}</div>}
            </>
          )}
        />

        <label htmlFor="price">Product Price:</label>
        <Controller
          name="price"
          control={control}
          rules={{ required: 'Product Price is required' }}
          render={({ field }) => (
            <>
              <input
                type="text"
                id="price"
                {...field}
                placeholder={errors.price ? '' : 'Product Price'}
              />
              {errors.price && <div className="error">&#9888; {errors.price.message}</div>}
            </>
          )}
        />

        <label htmlFor="phone">Product Phone Number:</label>
        <Controller
          name="phone"
          control={control}
          rules={{
            required: 'Product Phone Number is required',
            pattern: {
              value: /^(\d{10}|\d{3}-\d{3}-\d{4})$/,
              message: 'Invalid phone number format',
            },
          }}
          render={({ field }) => (
            <>
              <input
                type="text"
                id="phone"
                {...field}
                onChange={(e) => handlePhoneNumberChange(e.target.value, field.onChange)}
                placeholder={errors.phone ? '' : '___-___-____'}
              />
              {errors.phone && <div className="error">&#9888; {errors.phone.message}</div>}
            </>
          )}
        />

        <label htmlFor="address">Product Address:</label>
        <Controller
          name="address"
          control={control}
          rules={{ required: 'Product Address is required' }}
          render={({ field }) => (
            <>
              <input
                type="text"
                id="address"
                {...field}
                placeholder={errors.address ? '' : 'Product Address'}
              />
              {errors.address && <div className="error">&#9888; {errors.address.message}</div>}
            </>
          )}
        />

        <br />
        <button type="submit">{id ? 'Update' : 'Save'}</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddEditProduct;
