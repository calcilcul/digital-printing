<h1>Daftar Produk Printing</h1>

@foreach($products as $product)
    <p>{{ $product->name }} - Rp {{ $product->base_price }}</p>
@endforeach