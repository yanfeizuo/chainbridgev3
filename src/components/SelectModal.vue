<template>
  <v-dialog v-model="computedShow">
    <v-card class="card-center" max-width="500">
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <div v-if="data && data.length">
          <v-row v-for="item in data" :key="item.name">
            <v-col>
              <v-btn
                class="w-100 justify-start"
                size="x-large"
                @click="selectItem(item)"
              >
                <template v-slot:prepend>
                  <v-avatar>
                    <img width="40" height="40" :src="getImageUri(item)" alt="">
                  </v-avatar>
                </template>
                {{ getLabel(item) }}
              </v-btn>
            </v-col>
          </v-row>
        </div>
        <div v-else>NO DATA</div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" block @click="closeBtn">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { defineProps, computed } from 'vue';
  import logos from '@/constants/logos'

  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'title'
    },
    data: {
      type: Array,
      default() {
        return []
      }
    },
    symbolName: {
      type: String,
      default: 'nativeTokenSymbol'
    },
    close: {
      type: Function
    }
  })

  // const emit = defineEmits(["close"])

  const computedShow = computed({
    get() {
      return props.show
    },
    set() {
      closeBtn()
    }
  })

  const closeBtn = () => {
    // emit("close")
    props.close()
  }

  const selectItem = (data) => {
    props.close(data)
  }

  const getImageUri = (item) => {
    if (props.symbolName === 'symbol') {
      return item.imageUri
    } else {
      return logos[item.nativeTokenSymbol.toLowerCase()]
    }
  }

  const getLabel = (item) => {
    if (props.symbolName === 'symbol') {
      return item.symbol
    } else {
      return item.name
    }
  }

</script>

<style>

</style>