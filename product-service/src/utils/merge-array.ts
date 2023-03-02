const mergeArrayObjects = (arr1, arr2) => {
    let merged = [];

    for (let i = 0; i < arr1.length; i++) {
        merged.push({
            ...arr1[i],
            count: (arr2.find((itmInner) => itmInner.product_id === arr1[i].id)).count
        });
    }
    return merged
}

export default mergeArrayObjects;