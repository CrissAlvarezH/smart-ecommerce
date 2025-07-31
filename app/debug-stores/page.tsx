import { getAllStoresAction, getStoreBySlugAction } from "../actions";

export default async function DebugStores() {
  try {
    const { stores } = await getAllStoresAction({});
    
    let testStoreResult = null;
    if (stores.length > 0) {
      try {
        const firstStore = stores[0];
        testStoreResult = await getStoreBySlugAction({ slug: firstStore.slug });
      } catch (error) {
        testStoreResult = { error: String(error) };
      }
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Debug: All Stores</h1>
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="font-bold mb-2">All Stores:</h2>
          <pre>{JSON.stringify(stores, null, 2)}</pre>
        </div>
        <p className="mb-4">Total stores: {stores.length}</p>
        
        {stores.length > 0 && (
          <div className="bg-blue-100 p-4 rounded mb-4">
            <h2 className="font-bold mb-2">Test Store Fetch (slug: {stores[0].slug}):</h2>
            <pre>{JSON.stringify(testStoreResult, null, 2)}</pre>
          </div>
        )}
        
        {stores.length > 0 && (
          <div className="mt-4">
            <p>Try visiting: <a href={`/stores/${stores[0].slug}`} className="text-blue-600 underline">/stores/{stores[0].slug}</a></p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Debug: Error</h1>
        <div className="bg-red-100 p-4 rounded">
          <pre>{String(error)}</pre>
        </div>
      </div>
    );
  }
}