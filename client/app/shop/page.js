'use client';

import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../../components/ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    inStock: false,
    sort: 'newest',
  });

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '8', sort: filters.sort });
        if (filters.keyword) params.set('keyword', filters.keyword);
        if (filters.category) params.set('category', filters.category);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.minRating) params.set('minRating', filters.minRating);
        if (filters.inStock) params.set('inStock', 'true');

        const response = await fetch(`${API_URL}/products?${params.toString()}`, { cache: 'no-store' });
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [filters, page]);

  const categoryOptions = useMemo(
    () => [
      { value: 'women', label: 'Women' },
      { value: 'men', label: 'Men' },
      { value: 'kids', label: 'Kids' },
    ],
    []
  );

  return (
    <div className="container shop-layout">
      <aside className="filter-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
        >
          <div className="field-group">
            <label htmlFor="keyword">Search products</label>
            <div className="search-row">
              <input
                id="keyword"
                value={filters.keyword}
                onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                placeholder="Name or brand"
              />
              <button type="submit" className="primary-btn small-btn">Search</button>
            </div>
          </div>
        </form>

        <div className="field-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          >
            <option value="">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label>Price range</label>
          <div className="filter-row">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
              placeholder="Min"
            />
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
              placeholder="Max"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="rating">Minimum rating</label>
          <select
            id="rating"
            value={filters.minRating}
            onChange={(e) => setFilters((prev) => ({ ...prev, minRating: e.target.value }))}
          >
            <option value="">Any</option>
            <option value="4">4★ & up</option>
            <option value="3">3★ & up</option>
            <option value="2">2★ & up</option>
          </select>
        </div>

        <div className="field-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => setFilters((prev) => ({ ...prev, inStock: e.target.checked }))}
            />
            In stock only
          </label>
        </div>

        <div className="field-group">
          <label htmlFor="sort">Sort by</label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <button type="button" className="primary-btn" onClick={() => { setFilters({ keyword: '', category: '', minPrice: '', maxPrice: '', minRating: '', inStock: false, sort: 'newest' }); setPage(1); }}>
          Clear filters
        </button>
      </aside>

      <section>
        <div className="shop-results-head">
          <p>{products.length} curated products</p>
        </div>

        {loading ? (
          <div className="loading-row">Loading product catalog...</div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div className="page-controls">
              <button
                type="button"
                className={`page-control ${page === 1 ? 'disabled' : ''}`}
                onClick={() => page > 1 && setPage((p) => p - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>{page} / {totalPages}</span>
              <button
                type="button"
                className={`page-control ${page >= totalPages ? 'disabled' : ''}`}
                onClick={() => page < totalPages && setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
