export const requireDefault = async ( from: string ): Promise<any> => {
    const obj = await import( from );

    return obj.default;
};
