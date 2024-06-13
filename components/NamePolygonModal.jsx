import React from 'react';
import { View, Text, Modal, TextInput, Pressable, useColorScheme } from 'react-native';
import styles from '../styles';
 

const NamePolygonModal = ({ nameModalVisible, setNameModalVisible, currentName, setCurrentName, handleSavePolygon, handleCancelNaming }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Modal visible={nameModalVisible} transparent={true} animationType="slide">
      <View style={isDarkMode ? styles.nameModalContainerDark : styles.nameModalContainer}>
        <Text style={styles.modalTitle}>Name Your Area</Text>
        <TextInput
          style={isDarkMode ? styles.textInputDark : styles.textInput}
          placeholder="Enter Area Name"
          placeholderTextColor={isDarkMode ? "#CCC" : "#666"}
          value={currentName}
          onChangeText={setCurrentName}
        />
        <View style={styles.namingButtons}>
          <Pressable onPress={handleCancelNaming}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable onPress={handleSavePolygon}>
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default NamePolygonModal;
