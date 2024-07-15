const convertToHStore = (data: Record<string, any>): string => {
    return Object.keys(data)
        .map((key) => `"${key}"=>"${data[key]}"`)
        .join(', ');
};

export default convertToHStore;
