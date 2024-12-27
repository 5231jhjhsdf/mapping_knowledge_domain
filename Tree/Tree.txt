import pandas as pd
from sklearn.preprocessing import LabelEncoder

def read_csv(file_path):
    """
    读取 CSV 文件并进行初步处理
    :param file_path: CSV 文件路径
    :return: 处理后的数据框
    """
    try:
        df = pd.read_csv(file_path)
        return df
    except Exception as e:
        print(f"读取文件时出错: {e}")
        return None


def preprocess_data(df):
    """
    对读取的数据进行预处理，包括列名处理和标签编码
    :param df: 原始数据框
    :return: 预处理后的数据框、标签编码器
    """
    if df is None:
        return None, None

    # 使用LabelEncoder对疾病名称进行编码
    le_diseases = LabelEncoder()
    df['疾病_encoded'] = le_diseases.fit_transform(df['疾病大类'])

    # 将症状列的数据从字符串 '1' 和 '0' 转换为整数 1 和 0
    for col in df.columns[1:]:
        df[col] = df[col].astype(int)
    return df, le_diseases


def find_best_matching_disease(selected_symptoms, df):
    """
    找到与输入症状最匹配的疾病
    :param selected_symptoms: 输入的症状列表
    :param df: 数据框
    :return: 最匹配的疾病
    """
    max_match_count = 0
    best_disease = None
    for index, row in df.iterrows():
        match_count = sum(row[symptom] == 1 for symptom in selected_symptoms if symptom in df.columns)
        if match_count > max_match_count:
            max_match_count = match_count
            best_disease = row['疾病大类']
    return best_disease


if __name__ == "__main__":
    file_path = 'output.csv'  # CSV 文件路径
    df = read_csv(file_path)
    if df is not None:
        df, le_diseases = preprocess_data(df)
        while True:
            input_symptoms = input("请输入症状（以空格分隔），输入'exit'结束程序: ").split()
            if input_symptoms[0].lower() == 'exit':
                break
            predicted_disease = find_best_matching_disease(input_symptoms, df)
            if predicted_disease:
                print(f"预测的疾病为: {predicted_disease}")
            else:
                print("没有找到匹配的疾病。")